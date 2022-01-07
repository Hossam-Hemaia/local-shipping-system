const getUserType = () => {
  const selectedType = document.querySelector("[name=userType]").value;
  const csrf = document.querySelector("[name=_csrf]").value;
  const data = new URLSearchParams();
  data.append("userType", selectedType);
  fetch("/headOffice/removeUser", {
    body: data,
    method: "POST",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      const selectBox = document.querySelector(".usr");
      selectBox.innerHTML = "";
      for (let usr of data.type) {
        const option = document.createElement("option");
        option.value = usr._id;
        option.innerText = usr.name;
        selectBox.append(option);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const btnGtUsr = document.getElementById("btnGetUser");
if (btnGtUsr) {
  btnGtUsr.addEventListener("click", () => {
    getUserType();
  });
}

const removeUser = (btn) => {
  const selectedType = document.querySelector("[name=userType]").value;
  const agentId = document.querySelector("[name=agentId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;
  const data = new URLSearchParams();
  data.append("agentId", agentId);
  data.append("userType", selectedType);
  fetch("/headOffice/remove/User/", {
    body: data,
    method: "POST",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      if (data.message === "Success") {
        window.location.replace("/hq/dashBoard");
      } else {
        const errorMessage = document.querySelector(".message");
        errorMessage.innerText = "Faild to remove user";
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const btnRmvUsr = document.getElementById("removeUser");
if (btnRmvUsr) {
  btnRmvUsr.addEventListener("click", (e) => {
    removeUser(e.target);
  });
}

const getPackageData = () => {
  const barCode = document.querySelector("[name=barCode]").value;
  const csrf = document.querySelector("[name=_csrf]").value;
  const data = new URLSearchParams();
  data.append("barCode", barCode);
  fetch("/headOffice/modifyPackage", {
    body: data,
    method: "POST",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      const pkgData = document.getElementById("packageData");
      pkgData.innerHTML = "";
      Object.keys(data.packageData).forEach((key) => {
        if (key !== "tracker" && key !== "dAgentId" && key !== "rAgentId") {
          const input = document.createElement("input");
          input.name = key;
          input.value = data.packageData[key];
          pkgData.append(input);
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

const getPkgDta = document.getElementById("getPkgDta");
if (getPkgDta) {
  getPkgDta.addEventListener("click", () => {
    getPackageData();
  });
}

const returnedToSeller = () => {
  const csrf = document.querySelector("[name=_csrf]").value;
  const dateFrom = document.querySelector("[name=dateFrom]").value;
  const dateTo = document.querySelector("[name=dateTo]").value;
  const rAgent = document.querySelector("[name=rAgent]").value;
  let postUrl = "/reports/returnedToSeller";
  if (rAgent) {
    postUrl += "/rAgent";
  }
  const table = document.getElementById("tbl");
  const data = new URLSearchParams();
  data.append("dateFrom", dateFrom);
  data.append("dateTo", dateTo);
  fetch(postUrl, {
    body: data,
    method: "POST",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      Object.keys(data.returnStats).forEach((key) => {
        const div = document.createElement("div");
        div.classList.add("table");
        const p1 = document.createElement("p");
        p1.classList.add("name");
        p1.innerText = key;
        const p2 = document.createElement("p");
        p2.classList.add("numberofpackages");
        let pkgs =
          data.returnStats[key].delivered + data.returnStats[key].returned;
        p2.innerText = pkgs;
        const p3 = document.createElement("p");
        p3.classList.add("delivered");
        p3.innerText = data.returnStats[key].delivered;
        const p4 = document.createElement("p");
        p4.classList.add("returned");
        p4.innerText = data.returnStats[key].returned;
        let ratio = (data.returnStats[key].returned * 100) / pkgs;
        const p5 = document.createElement("p");
        p5.classList.add("ratio");
        p5.innerText = `${ratio.toFixed(2)} %`;
        div.append(p1, p2, p3, p4, p5);
        table.append(div);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

const rtrndToSllr = document.getElementById("rtrndToSllr");
if (rtrndToSllr) {
  rtrndToSllr.addEventListener("click", () => {
    returnedToSeller();
  });
}

const dAgentStats = () => {
  const csrf = document.querySelector("[name=_csrf]").value;
  const region = document.querySelector("[name=region]").value;
  const dateFrom = document.querySelector("[name=dateFrom]").value;
  const dateTo = document.querySelector("[name=dateTo]").value;
  const rAgent = document.querySelector("[name=rAgent]").value;
  let postUrl = "/reports/dAgentStats";
  if (rAgent) {
    postUrl += "/rAgent";
  }
  const table = document.getElementById("tbl");
  const data = new URLSearchParams();
  data.append("region", region);
  data.append("dateFrom", dateFrom);
  data.append("dateTo", dateTo);
  fetch(postUrl, {
    body: data,
    method: "POST",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      Object.keys(data.returnStats).forEach((key) => {
        const div = document.createElement("div");
        div.classList.add("table");
        const p1 = document.createElement("p");
        p1.classList.add("name");
        p1.innerText = key;
        const p2 = document.createElement("p");
        p2.classList.add("received");
        let pkgs =
          data.returnStats[key].delivered + data.returnStats[key].returned;
        p2.innerText = pkgs;
        const p3 = document.createElement("p");
        p3.classList.add("delivered");
        p3.innerText = data.returnStats[key].delivered;
        const p4 = document.createElement("p");
        p4.classList.add("rejected");
        p4.innerText = data.returnStats[key].returned;
        let ratio = (data.returnStats[key].delivered * 100) / pkgs;
        const p5 = document.createElement("p");
        p5.classList.add("ratio");
        p5.innerText = `${ratio.toFixed(2)} %`;
        div.append(p1, p2, p3, p4, p5);
        table.append(div);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

const dAgntStats = document.getElementById("dAgntStats");
if (dAgntStats) {
  dAgntStats.addEventListener("click", () => {
    dAgentStats();
  });
}

const dailyClose = () => {
  const csrf = document.querySelector("[name=_csrf]").value;
  const region = document.querySelector("[name=region]").value;
  const date = document.querySelector("[name=date]").value;
  const rAgent = document.querySelector("[name=rAgent]").value;
  let postUrl = "/reports/dailyClose";
  if (rAgent) {
    postUrl += "/rAgent";
  }
  const table = document.querySelector(".tbl");
  const data = new URLSearchParams();
  data.append("region", region);
  data.append("date", date);
  fetch(postUrl, {
    body: data,
    method: "POST",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      table.innerHTML = "";
      const p1 = document.createElement("p");
      p1.classList.add("total");
      p1.innerText = "اجمالى الشحنات: " + data.returnStats.pkgs;
      const p2 = document.createElement("p");
      p2.classList.add("delivered");
      p2.innerText = "ما تم توزيعه: " + data.returnStats.delivered;
      const p3 = document.createElement("p");
      p3.classList.add("Remaining");
      p3.innerText = "المتبقى: " + data.returnStats.remaining;
      table.append(p1, p2, p3);
    })
    .catch((err) => {
      console.log(err);
    });
};

const dlyCls = document.getElementById("dlyCls");
if (dlyCls) {
  dlyCls.addEventListener("click", () => {
    dailyClose();
  });
}

const cAgentStats = () => {
  const csrf = document.querySelector("[name=_csrf]").value;
  const dateFrom = document.querySelector("[name=dateFrom]").value;
  const dateTo = document.querySelector("[name=dateTo]").value;
  let postUrl = "/reports/cAgentStats/show";
  const table = document.getElementById("tbl");
  const data = new URLSearchParams();
  data.append("dateFrom", dateFrom);
  data.append("dateTo", dateTo);
  fetch(postUrl, {
    body: data,
    method: "POST",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      for (let call of data.calls) {
        const div = document.createElement("div");
        div.classList.add("table");
        const p1 = document.createElement("p");
        p1.classList.add("name");
        const str = `${call.date}`;
        const shortStr = str.substr(0, str.indexOf("T"));
        p1.innerText = shortStr;
        const p2 = document.createElement("p");
        p2.classList.add("received");
        p2.innerText = call.callType;
        const p3 = document.createElement("p");
        p3.classList.add("delivered");
        p3.innerText = call.callingNumber;
        const p4 = document.createElement("p");
        p4.classList.add("rejected");
        p4.innerText = call.callSummery;
        p4.style.wordWrap = "break-word";
        p4.style.width = "10rem";
        const p5 = document.createElement("p");
        p5.classList.add("ratio");
        p5.innerText = call.cAgentId.name;
        div.append(p1, p2, p3, p4, p5);
        table.append(div);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const cAgntStats = document.getElementById("cAgntStats");
if (cAgntStats) {
  cAgntStats.addEventListener("click", () => {
    cAgentStats();
  });
}

const getRegion = () => {
  const userType = document.querySelector("[name=userType]").value;
  const region = document.querySelector("[name=region]").value;
  const csrf = document.querySelector("[name=_csrf]").value;
  let url;
  if (userType === "callAgent") {
    url = "/cAgent/getAgents";
  } else {
    url = "/headOffice/getAgents";
  }
  const data = new URLSearchParams();
  data.append("region", region);
  fetch(url, {
    body: data,
    method: "POST",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      const selectBox = document.getElementById("agnt");
      selectBox.innerHTML = "";
      for (let agent of data.agents) {
        const option = document.createElement("option");
        option.value = agent._id;
        option.innerText = agent.name;
        selectBox.append(option);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const btnGtRgn = document.getElementById("btnGtRgn");
if (btnGtRgn) {
  btnGtRgn.addEventListener("click", () => {
    getRegion();
  });
}
