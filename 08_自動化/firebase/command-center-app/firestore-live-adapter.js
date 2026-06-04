// Phase 2：Firebase Auth + Firestore 即時讀取 adapter。
// 目前只讀取資料；第一次登入若尚未建立 role，會回報 UID 供建立 owner 權限。

export async function loadFirebaseCommandCenter({ firebaseConfig }) {
  const [{ initializeApp }, { getAuth, signInWithPopup, GoogleAuthProvider }, firestore] =
    await Promise.all([
      import("https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js"),
    ]);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  const signedInUser = {
    uid: credential.user.uid,
    email: credential.user.email,
    display_name: credential.user.displayName,
  };
  globalThis.EWALK_LAST_FIREBASE_USER = signedInUser;

  const db = firestore.getFirestore(app);
  const userRole = await firestore.getDoc(firestore.doc(db, "users", credential.user.uid));

  if (!userRole.exists()) {
    const error = new Error(
      `已登入 ${signedInUser.email || "Google 帳號"}，但尚未建立 users/${signedInUser.uid} 權限文件。`
    );
    error.code = "EWALK_MISSING_ROLE";
    error.user = signedInUser;
    throw error;
  }

  const roleData = userRole.data();
  const allowedRoles = new Set(["owner", "admin", "manager", "staff"]);
  if (roleData.status !== "active" || !allowedRoles.has(roleData.role)) {
    throw new Error(`目前帳號 role=${roleData.role || "unknown"}，不可讀取內部 Command Center。`);
  }

  const [clients, contentQueue, campaignReports, aiRuns, approvals] = await Promise.all([
    firestore.getDocs(firestore.collection(db, "clients")),
    firestore.getDocs(firestore.collection(db, "content_queue")),
    firestore.getDocs(firestore.collection(db, "campaign_reports")),
    firestore.getDocs(firestore.collection(db, "ai_runs")),
    firestore.getDocs(firestore.collection(db, "approvals")),
  ]);

  const normalizeValue = (value) => {
    if (value && typeof value.toDate === "function") return value.toDate().toISOString();
    if (Array.isArray(value)) return value.map((item) => normalizeValue(item));
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, normalizeValue(child)]));
    }
    return value;
  };

  const normalizeDoc = (doc) => ({ id: doc.id, ...normalizeValue(doc.data()) });

  return {
    project_id: firebaseConfig.projectId,
    loaded_at: new Date().toISOString(),
    user: signedInUser,
    role: roleData.role,
    clients: clients.docs.map((doc) => normalizeDoc(doc)),
    content_queue: contentQueue.docs.map((doc) => normalizeDoc(doc)),
    campaign_reports: campaignReports.docs.map((doc) => normalizeDoc(doc)),
    ai_runs: aiRuns.docs.map((doc) => normalizeDoc(doc)),
    approvals: approvals.docs.map((doc) => normalizeDoc(doc)),
  };
}
