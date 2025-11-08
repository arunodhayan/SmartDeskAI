# 🧠 SmartDesk AI  
### Your Intelligent Research Assistant for PDFs, Websites, and Scientific Articles  

![SmartDesk AI Banner](https://github.com/arunodhayan/images-readme/raw/main/app-descriptiion2.png)

SmartDesk AI is an **AI-powered summarization and research companion** that allows you to open, read, and interact with scientific papers, PDF reports, and webpages.  
It is available as both a **desktop application (macOS/Linux)** and a **browser extension**, connecting seamlessly to your **FastAPI backend** or **cloud LLMs** like GPT-4o-mini.

---

## 🚀 Key Features

✅ **Smart Summarization** — Extract abstracts, key findings, and methods from PDFs or webpages  
✅ **Interactive Q&A** — Ask questions about methods, datasets, or results  
✅ **Local + Cloud AI** — Works offline (Gemma-3n) or online (GPT-4o-mini)  
✅ **Cross-Platform** — Supports macOS and Linux  
✅ **Research-Optimized** — Designed for scientific literature like MDPI, IEEE, Springer, and arXiv papers  

---

## 💻 Desktop App

![SmartDesk AI Screenshot 1](https://github.com/arunodhayan/images-readme/raw/main/app-description.png)
![SmartDesk AI Screenshot 2](https://github.com/arunodhayan/images-readme/raw/main/app_description1.png)

### 🧭 How It Works
1. **Choose Document** — Select or drag a PDF into SmartDesk AI.  
2. **Summarize** — AI summarizes the key problem, methods, and results.  
3. **Ask Anything** — Type queries like “What dataset was used?” or “What’s the Dice score?”  

### 🧩 Example Output
```text
Best Dice Score: 82.25 ± 0.74%
Datasets: DukeSD-OCT, Heidelberg, UMN
Architecture: Stacked Multiscale Encoders and Decoders
Improvement: +1.55% vs. single-stage model
```

### 📦 Installation (macOS/Linux)
Download from Hugging Face:  
👉 [SmartDesk AI macOS/Linux Package](https://huggingface.co/datasets/Arunodhayan/SmartdeskAI-package/tree/main)

Or build manually:
```bash
git clone https://github.com/arunodhayan/SmartDeskAI.git
cd SmartDeskAI
npm install
npm run build
npm start
```

---

## 🌐 Browser Extension

![SmartDesk AI Extension Screenshot 1](https://github.com/arunodhayan/images-readme/raw/main/browser-extension.png)
![SmartDesk AI Extension Screenshot 2](https://github.com/arunodhayan/images-readme/raw/main/browser-extension-1.png)

### 🔍 Features
- 📰 **Summarize Webpages Instantly** — Extract abstracts and results from online articles  
- 🧩 **Highlight Research Sections** — Identify Abstract, Methods, Results, and Conclusions  
- 💬 **Ask Contextual Questions** — Interact directly with the webpage content  
- ⚡ **Instant Insights** — Retrieve datasets, architectures, and performance metrics in seconds  

### 🧪 Example Workflow
When visiting an MDPI or IEEE paper:
1. Click **Summarize Page**  
2. Instantly see:
   - **Research Focus:** OCT Image Segmentation  
   - **Model:** Stacked Multiscale Encoders/Decoders  
   - **Score:** 82.25 ± 0.74% Sørensen–Dice  
   - **Improvement:** +1.55%  
   - **Datasets:** DukeSD-OCT, Heidelberg, UMN  

---

## 🔗 Hugging Face Dataset

📦 All macOS/Linux app packages and support files are hosted at:  
👉 **[https://huggingface.co/datasets/Arunodhayan/SmartdeskAI-package/tree/main](https://huggingface.co/datasets/Arunodhayan/SmartdeskAI-package/tree/main)**

---

## ⚙️ Tech Stack

| Component | Technology |
|------------|-------------|
| **Frontend** | Electron.js, HTML, CSS, JavaScript |
| **Backend** | FastAPI (Python) + Docker |
| **Models** | Gemma-3n-E2B-IT (local), GPT-4o-mini (cloud) |
| **Packaging** | Electron Builder (.dmg / .AppImage) |
| **Platforms** | macOS · Linux (Ubuntu 22.04+) |

---

## 🧠 Typical Workflow

| Step | Action | Output |
|------|---------|--------|
| 1️⃣ | Open a paper (PDF or webpage) | Extracted text |
| 2️⃣ | Click **Summarize** | AI-generated summary |
| 3️⃣ | Ask a question | Contextual response |
| 4️⃣ | Export | Copy or save summary |

---

## 👨‍💻 Author

**Arunodhayan Sampath Kumar M.Sc.**  
*Junior Professorship of Media Computing, Chemnitz University of Technology*  

---

## 🪪 License

MIT License © 2025 Arunodhayan Sampath Kumar
