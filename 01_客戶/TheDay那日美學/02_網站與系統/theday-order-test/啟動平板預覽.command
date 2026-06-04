#!/bin/zsh
cd "$(dirname "$0")"
echo "TheDay 那日美學｜分店內部訂購測試版"
echo ""
echo "請確認 iPad / 平板與這台 Mac 連在同一個 Wi-Fi。"
echo "啟動後，請用下方網址在平板瀏覽器開啟："
echo ""
ip=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
if [ -n "$ip" ]; then
  echo "http://$ip:4188/"
else
  echo "請在系統網路設定查看這台 Mac 的 IP，網址格式為 http://IP:4188/"
fi
echo ""
echo "若終端機詢問是否允許區域網路連線，請按允許。"
echo "關閉此視窗就會停止測試版。"
echo ""
node server.mjs
