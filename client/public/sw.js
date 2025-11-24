
const getText = (type) => {
  switch (type) {

    case "video":
      return "📹 Video";
    case "image":
      return "📷 Image";
    case "audio":
      return "🎤 Audio";
    case "file":
      return "📁 File";
    default:
      return undefined
  }
}
self.addEventListener("message", (event) => {
  const msg = event.data;
  self.registration.showNotification(msg.sender || "New Message", {
    body: getText(msg.type) ?? msg.content,
    icon: msg.icon || "/logo.png",
  });
});


// i will extract and emit just
//  { sender, type, content, dp } dp asin sender dp
//
