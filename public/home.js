// 要素の取得
const input = document.getElementById("user-input");
const button = document.getElementById("send-btn");
const chatBox = document.getElementById("chat-box");
const avatarInput = document.getElementById("avatar-input");

// ===============================
//  ユーザーアイコン（データURL）
// ===============================
let userAvatarDataUrl = localStorage.getItem("userAvatar") || null;

// ===============================
//  ページ読み込み時：履歴とアイコンを復元
// ===============================
window.addEventListener("load", () => {
  const saved = localStorage.getItem("chatHistory");
  if (saved) {
    chatBox.innerHTML = saved;
  }

  // 既存のユーザーアバターにクリックハンドラ＆画像を付ける
  attachUserAvatarHandlers();
  chatBox.scrollTop = chatBox.scrollHeight;
});

// 現在時刻
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

// ユーザーアバターにイベントと画像を付ける
function attachUserAvatarHandlers() {
  const avatars = document.querySelectorAll(".avatar.user-avatar");
  avatars.forEach((avatar) => {
    avatar.addEventListener("click", handleAvatarClick);
    if (userAvatarDataUrl) {
      avatar.style.backgroundImage = `url(${userAvatarDataUrl})`;
    }
  });
}

// アバタークリック → ファイル選択
function handleAvatarClick() {
  avatarInput.click();
}

// ファイル選択 → 画像読み込み＆保存
avatarInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    userAvatarDataUrl = reader.result;
    localStorage.setItem("userAvatar", userAvatarDataUrl);

    // すべてのユーザーアバターに反映
    document.querySelectorAll(".avatar.user-avatar").forEach((avatar) => {
      avatar.style.backgroundImage = `url(${userAvatarDataUrl})`;
    });
  };
  reader.readAsDataURL(file);
});

// メッセージ追加関数
function addMessage(sender, text) {
  const line = document.createElement("div");
  line.className = "msg " + (sender === "user" ? "user-msg" : "ai-msg");

  // 名前（吹き出しの外）
  const nameTag = document.createElement("div");
  nameTag.className = "name-tag";
  nameTag.textContent = sender === "user" ? "You" : "秘書";

  // アバター
  const avatar = document.createElement("div");
  if (sender === "user") {
    avatar.className = "avatar user-avatar";
    if (userAvatarDataUrl) {
      avatar.style.backgroundImage = `url(${userAvatarDataUrl})`;
    }
    avatar.addEventListener("click", handleAvatarClick);
    avatar.textContent = ""; // 画像アイコン前提
  } else {
    avatar.className = "avatar ai-avatar";
    avatar.textContent = "A"; // 秘書は丸Aのまま
  }

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

  // 履歴を保存
  localStorage.setItem("chatHistory", chatBox.innerHTML);
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
