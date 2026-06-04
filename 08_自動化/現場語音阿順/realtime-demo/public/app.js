const state = {
  pc: null,
  dc: null,
  stream: null
};

const $ = (id) => document.getElementById(id);

function setRunning(isRunning) {
  $("startBtn").disabled = isRunning;
  $("stopBtn").disabled = !isRunning;
}

async function startRealtime() {
  setRunning(true);

  const pc = new RTCPeerConnection();
  const audio = $("remoteAudio");
  pc.ontrack = (event) => {
    audio.srcObject = event.streams[0];
  };

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((track) => pc.addTrack(track, stream));

  const dc = pc.createDataChannel("oai-events");
  dc.onmessage = async (event) => {
    const message = JSON.parse(event.data);
    handleRealtimeEvent(message);
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const sdpResponse = await fetch("/session", {
    method: "POST",
    headers: { "content-type": "application/sdp" },
    body: offer.sdp
  });

  if (!sdpResponse.ok) {
    const error = await sdpResponse.json().catch(() => ({}));
    throw new Error(error.error || "Realtime session 建立失敗");
  }

  const answer = { type: "answer", sdp: await sdpResponse.text() };
  await pc.setRemoteDescription(answer);

  state.pc = pc;
  state.dc = dc;
  state.stream = stream;
}

async function handleRealtimeEvent(message) {
  if (message.type !== "response.function_call_arguments.done" || message.name !== "searchKnowledge") return;

  const args = JSON.parse(message.arguments || "{}");
  const result = await fetch("/tool/searchKnowledge", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: args.query || "" })
  }).then((res) => res.json());

  state.dc?.send(JSON.stringify({
    type: "conversation.item.create",
    item: {
      type: "function_call_output",
      call_id: message.call_id,
      output: JSON.stringify(result)
    }
  }));
  state.dc?.send(JSON.stringify({ type: "response.create" }));
}

function stopRealtime() {
  state.stream?.getTracks().forEach((track) => track.stop());
  state.dc?.close();
  state.pc?.close();
  state.pc = null;
  state.dc = null;
  state.stream = null;
  setRunning(false);
}

$("startBtn").addEventListener("click", () => startRealtime().catch((error) => {
  stopRealtime();
  window.alert(error.message);
}));
$("stopBtn").addEventListener("click", stopRealtime);
