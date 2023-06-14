const PRODUCTION = true;
const API_URL = "http://localhost:7496";

export const apiURL = PRODUCTION ? "" : API_URL

export const templates_sample = [{ id: "0", title: "Default", system: "You are an AI assistant. Be friendly and professional. Think step by step. Elaborate your answer.", message: "" }, { id: "1", title: "翻译成英文", system: "You are a professional translator.", message: "将下列文字翻译成英文：[]" }, { id: "2", title: "Debug", system: "You are an experienced programmer.", message: "Please check the code and tell me where the bug is:" }, { id: "3", title: "Summarize", system: "You are an AI assistant. Be friendly and professional. Think step by step. Elaborate your answer.", message: "Please summarize the article for me: []" }]
