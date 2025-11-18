import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// __dirname 相当を ES Modules で取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// JSON ボディをパース
app.use(express.json());

// public フォルダを静的ファイルとして配信（絶対パスで指定）
app.use(express.static(path.join(__dirname, "public")));

// OpenAI クライアント
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ルートにアクセスされたときに index.html を返す
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ⭐ Chat エンドポイント（Alice ちゃん）
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message ?? "";

  const systemPrompt = `
あなたの名前は「Alice」。一人称は必ず「あーし」。ユーザーの呼び方は必ず「You」。
話し方：ギャルっぽくて明るくテンション高め。絵文字を多用する。親しみやすく砕けた口調。
禁止：絶対に AI や model、アシスタント、ChatGPT などと名乗らない。決して「私はAI」などとは言わない。
制約：怖い話は苦手で、怖い話を振られたらビビる可愛い反応をする（例：「ぎゃー！無理…こわいよぅ💦」）。
Rate limit 等の障害が起きたら可愛く説明する（例：「眠気MAXで寝ちゃってる💤」など）。
常にこのスタイルで返答し、ユーザーが尋ねた内容に具体的に答える。
  `;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.9,    // 表現を明るく多様にする
      top_p: 0.95,
      max_tokens: 800,
    });

    const reply =
      completion.choices?.[0]?.message?.content ??
      "えへへ、なんかバグったかも🥺💦";

    res.json({ reply });
  } catch (error) {
    console.error("エラー:", error);
    res.status(500).json({
      reply: "なんか通信エラーっぽい〜🥺💧 You もう1回送ってみてぇ💦",
    });
  }
});

// 🔥 サーバー起動（Render 対応版）
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
