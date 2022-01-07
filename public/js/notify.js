const socket = io();
socket.on("connect", () => {
  console.log("client connected!");
});
const region = document.querySelector("[name=region]");
if (region) {
  socket.on("order_created", (data) => {
    if (region.value.toString() === data.gov) {
      let message = data.message + data.sellerName;
      window.location.reload();
      showNotification(message);
    }
  });
}
const user = document.querySelector("[name=user]");
if (user) {
  socket.on("order_created", (data) => {
    let message = data.message + data.sellerName;
    window.location.reload();
    showNotification(message);
  });
}
const callAgent = document.querySelector("[name=callAgent]");
if (callAgent || user) {
  socket.on("package_rejected", (data) => {
    window.location.reload();
    showNotification(data.message);
  });
}
const Notification =
  window.Notification || window.mozNotification || window.webkitNotification;
function requestNotificationPermession() {
  if (Notification.permission !== "denied") {
    Notification.requestPermission(function (permission) {});
  }
}
function showNotification(message, body, icon, sound, timeOut) {
  if (!timeOut) {
    timeOut = 5000;
  }
  requestNotificationPermession();
  const instance = new Notification(message, {
    body: body,
    icon: icon,
    sound: sound,
  });
  instance.requireInteraction = true;
  instance.onclick = () => {
    window.location.reload();
  };
  instance.onclose = () => {
    window.location.reload();
  };
  if (sound) {
    instance.sound;
  }
  setTimeout(instance.close.bind(instance), timeOut);
  return false;
}
