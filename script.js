const chatContainer = document.getElementById("chat-container");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

const BACKEND_CHAT_API = "https://be-agent-goon.vercel.app/api/chat";

let chatHistory = [];

// fungsi untuk mengurai tautan Markdown
function parseMarkdownLinks(text) {
  const mdLinksParsed = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  return mdLinksParsed.replace(/(?<!href=")(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>');
}

// fungsi untuk merender pesan chat
function renderChatBubble(message, sender) {
  const messageWrapper = document.createElement("div");
  messageWrapper.classList.add("chat-message", sender);

  const avatar = document.createElement("div");
  avatar.classList.add("avatar", sender);

  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble");

  if (sender === "bot") {
    bubble.innerHTML = parseMarkdownLinks(message);
    messageWrapper.appendChild(avatar);
    messageWrapper.appendChild(bubble);
  } else {
    bubble.textContent = message;
    messageWrapper.appendChild(bubble);
    messageWrapper.appendChild(avatar);
  }

  chatContainer.appendChild(messageWrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// fungsi untuk merender pesan loading
function renderLoading() {
  const messageWrapper = document.createElement("div");
  messageWrapper.classList.add("chat-message", "bot");

  const avatar = document.createElement("div");
  avatar.classList.add("avatar", "bot");

  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble");

  const spinner = document.createElement("div");
  spinner.classList.add("loading-spinner");

  bubble.appendChild(spinner);

  messageWrapper.appendChild(avatar);
  messageWrapper.appendChild(bubble);

  chatContainer.appendChild(messageWrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  return messageWrapper;
}

// fungsi untuk menghapus pesan loading
function removeLoading(bubble) {
  chatContainer.removeChild(bubble);
}

// fungsi untuk mengirim pesan ke backend
async function sendMessageToBackend(question, history) {
  try {
    const response = await fetch(BACKEND_CHAT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, history }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    return data.text || "Maaf, saya tidak mengerti.";
  } catch (err) {
    console.error(err);
    return "Maaf, terjadi kesalahan saat menghubungi server.";
  }
}

// event listener untuk menangani pengiriman form chat
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = userInput.value.trim();
  if (!question) return;

  renderChatBubble(question, "user");
  chatHistory.push({ role: "user", content: question });

  userInput.value = "";
  userInput.disabled = true;

  const loadingBubble = renderLoading();

  const answer = await sendMessageToBackend(question, chatHistory);

  removeLoading(loadingBubble);
  renderChatBubble(answer, "bot");

  chatHistory.push({ role: "bot", content: answer });

  userInput.disabled = false;
  userInput.focus();
});
