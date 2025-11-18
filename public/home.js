// 要素の取得
const input = document.getElementById("user-input");
const button = document.getElementById("send-btn");
const chatBox = document.getElementById("chat-box");

// 時刻の関数
function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

// HTMLエスケープ
function escapeHtml(s = "") {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\n", "<br>");
}

// メッセージ追加関数
function addMessage(sender, text) {
  const line = document.createElement("div");
  line.className = "msg " + (sender === "user" ? "user-msg" : "ai-msg");

  // 名前（吹き出しの外）
  const nameTag = document.createElement("div");
  nameTag.className = "name-tag";
  nameTag.textContent = sender === "user" ? "You" : "秘書Alice";

  // アバター
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = sender === "user" ? "You" : "A";

  // 吹き出し
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = `
    <div class="text">${escapeHtml(text)}</div>
    <span class="meta">${nowTime()}</span>
  `;

  // 配置
  if (sender === "user") {
    line.appendChild(nameTag);
    line.appendChild(bubble);
    line.appendChild(avatar);
  } else {
    line.appendChild(avatar);
    line.appendChild(bubble);
    line.appendChild(nameTag);
  }

  chatBox.appendChild(line);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 送信ボタン
button.addEventListener("click", async () => {
  const message = input.value.trim();
  if (!message) return;

  addMessage("user", message);
  input.value = "";

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await res.json();
  addMessage("ai", data.reply);
});