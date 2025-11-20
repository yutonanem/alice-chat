// 要素の取得
const input = document.getElementById("user-input");
const button = document.getElementById("send-btn");
const chatBox = document.getElementById("chat-box");
const avatarInput = document.getElementById("avatar-input");

// 秘書アイコン（Base64データURL）
let assistantAvatarDataUrl = localStorage.getItem("assistantAvatar") || null;

// ページ読み込み時：履歴とアイコンを復元
window.addEventListener("load", () => {
  const saved = localStorage.getItem("chatHistory");
  if (saved) {
    chatBox.innerHTML = saved;
  }

  // 古い履歴のアバターを新仕様に整える
  normalizeAvatars();

  // 秘書アバターにクリックハンドラ＆画像を付ける
  attachAssistantAvatarHandlers();

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

// 古い履歴のアバターを新仕様にする
function normalizeAvatars() {
  // 秘書側
  document.querySelectorAll(".msg.ai-msg .avatar").forEach((avatar) => {
    avatar.classList.add("ai-avatar");
    if (!avatar.textContent) {
      avatar.textContent = "A";
    }
  });
  // ユーザー側は CSS で非表示にしているので放置でOK
}

// 秘書アバターにイベントと画像を付ける
function attachAssistantAvatarHandlers() {
  const avatars = document.querySelectorAll(".avatar.ai-avatar");
  avatars.forEach((avatar) => {
    avatar.addEventListener("click", handleAvatarClick);
    if (assistantAvatarDataUrl) {
      avatar.style.backgroundImage = `url(${assistantAvatarDataUrl})`;
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
    assistantAvatarDataUrl = reader.result;
    localStorage.setItem("assistantAvatar", assistantAvatarDataUrl);

    // すべての秘書アバターに反映
    document.querySelectorAll(".avatar.ai-avatar").forEach((avatar) => {
      avatar.style.backgroundImage = `url(${assistantAvatarDataUrl})`;
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

  let avatar = null;

  if (sender === "ai") {
    // 秘書側のアバター
    avatar = document.createElement("div");
    avatar.className = "avatar ai-avatar";
    avatar.textContent = "A";
    if (assistantAvatarDataUrl) {
      avatar.style.backgroundImage = `url(${assistantAvatarDataUrl})`;
    }
    avatar.addEventListener("click", handleAvatarClick);
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
    // ユーザー側はアイコンなし
    line.appendChild(nameTag);
    line.appendChild(bubble);
  } else {
    // 秘書側はアイコンあり
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
