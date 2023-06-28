const commands = `
/help -  command list
/ask - Ask a question chatGPT 3.5
/asknew - Start a new conversation with chatGPT 3.5
/reset - Clear chat history. Save tokens
`;

const awaitSticker = `CAACAgIAAxkBAAIFd2Q5QEdnFtl49aIzewQcwnKqorOKAAI8GgACSlpIShDgGaLFZ6kcLwQ`; // Sticker while waiting for a response from ChatGPT

module.exports.commands = commands;
module.exports.awaitSticker = awaitSticker;
