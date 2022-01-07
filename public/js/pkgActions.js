const options = {
  enableHighAccuracy: true,
};
const getLocation = new Promise((res, rej) => {
  window.navigator.geolocation.getCurrentPosition(
    (pos) => {
      const currentPos = {
        lat: pos.coords.latitude,
        long: pos.coords.longitude,
      };
      res(currentPos);
    },
    (err) => {
      rej(err);
    },
    options
  );
});

const createPackage = (frm) => {
  const csrf = document.querySelector("[name=_csrf]").value;
  const pkgData = frm.querySelectorAll(".frmInput");
  const data = new URLSearchParams();
  for (let i = 0; i < pkgData.length; ++i) {
    data.append(pkgData[i].name, pkgData[i].value);
  }
  fetch("/rAgent/createPackage", {
    method: "POST",
    body: data,
    headers: {
      "csrf-token": csrf,
    },
  })
    .then(async (res) => ({
      fileName: res.headers.get("content-disposition").split("=")[1],
      blob: await res.blob(),
    }))
    .then((resObj) => {
      const newBlob = new Blob([resObj.blob], { type: "application/pdf" });
      const fileUrl = URL.createObjectURL(newBlob);
      const newWin = window.open(fileUrl);
      newWin.focus();
    })
    .catch((err) => {
      console.log(err);
    });
};

const crtPkgs = document.querySelectorAll(".crtPkg");
if (crtPkgs) {
  for (let i = 0; i < crtPkgs.length; ++i) {
    crtPkgs[i].addEventListener("click", (e) => {
      e.preventDefault();
      createPackage(e.target.parentNode.parentNode);
    });
  }
}

const printPackagePolicy = (btn) => {
  const inputData = btn.parentNode.querySelector("[name=pId]").value;
  const csrf = document.querySelector("[name=_csrf]").value;
  data = new URLSearchParams();
  data.append("packageId", inputData);
  fetch("/rAgent/printPolicy", {
    method: "POST",
    body: data,
    headers: {
      "csrf-token": csrf,
    },
  })
    .then(async (res) => ({
      fileName: res.headers.get("content-disposition").split("=")[1],
      blob: await res.blob(),
    }))
    .then((resObj) => {
      const newBlob = new Blob([resObj.blob], { type: "application/pdf" });
      const fileUrl = URL.createObjectURL(newBlob);
      const newWin = window.open(fileUrl);
      newWin.focus();
    })
    .catch((err) => {
      console.log(err);
    });
};

const prntPkgPlcys = document.querySelectorAll(".prntPkgPlcy");
if (prntPkgPlcys) {
  for (let i = 0; i < prntPkgPlcys.length; ++i) {
    prntPkgPlcys[i].addEventListener("click", (e) => {
      e.preventDefault();
      printPackagePolicy(e.target);
    });
  }
}

const checkPackage = (frm) => {
  const csrf = document.querySelector("[name=_csrf]").value;
  const formData = frm.querySelectorAll(".frmInput");
  const data = new URLSearchParams();
  for (let i = 0; i < formData.length; ++i) {
    if (formData[i].name === "pId" || formData[i].name === "barCode") {
      data.append(formData[i].name, formData[i].value);
    }
  }
  fetch("/rAgent/checkPackage", {
    method: "POST",
    body: data,
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      if (data.message === "success") {
        const formDiv = frm.parentNode;
        formDiv.style.background = "green";
      } else if (data.message === "faild") {
        alert("this package is already checked or not valid");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const chkPkgs = document.querySelectorAll(".chkPkg");
if (chkPkgs) {
  for (let i = 0; i < chkPkgs.length; ++i) {
    chkPkgs[i].addEventListener("click", (e) => {
      e.preventDefault();
      checkPackage(e.target.parentNode.parentNode);
    });
  }
}

const returnPackage = (btn) => {
  const inputData = btn.parentNode.querySelector("[name=pId]").value;
  const orderId = btn.parentNode.querySelector("[name=orderId]").value;
  const csrf = document.querySelector("[name=_csrf]").value;
  data = new URLSearchParams();
  data.append("packageId", inputData);
  data.append("dOrderId", orderId);
  fetch("/dAgent/returnPackage", {
    method: "POST",
    body: data,
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      if (data.message === "returnd") {
        location.reload();
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const rtrnPkgs = document.querySelectorAll(".rtrnPkg");
if (rtrnPkgs) {
  for (let i = 0; i < rtrnPkgs.length; ++i) {
    rtrnPkgs[i].addEventListener("click", (e) => {
      returnPackage(e.target);
    });
  }
}

const displayInputs = (btn) => {
  const selectValue = btn.parentNode.querySelector("[name=dAgentId]").value;
  const fetchType = btn.parentNode.querySelector("[name=fetchType]").value;
  const csrf = document.querySelector("[name=_csrf]").value;
  const data = new URLSearchParams();
  if (fetchType === "regions") {
    data.append("fetchType", fetchType);
  }
  data.append("dAgentId", selectValue);
  fetch("/secAgent/security", {
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
      const form = document.getElementById("secureInputs");
      if (form.childElementCount > 0) {
        form.innerHTML = "";
      }
      const dAgent = document.getElementById("dAgent");
      for (let i = 0; i < data.inputsNumber; ++i) {
        let input = document.createElement("input");
        input.name = "barCode";
        input.classList.add("code");
        form.append(input);
        dAgent.value = data.dAgentId;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const dsplyInpts = document.getElementById("dsplyInpts");
if (dsplyInpts) {
  dsplyInpts.addEventListener("click", (e) => {
    displayInputs(e.target);
  });
}

const securePackages = () => {
  const dAgentId = document.querySelector("[name=agentId]").value;
  const fetchType = document.getElementById("fType").value;
  const csrf = document.querySelector("[name=_csrf]").value;
  const data = new URLSearchParams();
  if (fetchType === "regions") {
    data.append("fetchType", fetchType);
  }
  data.append("dAgentId", dAgentId);
  fetch("/secAgent/security/checkPackages", {
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
      const codeInputs = document.querySelectorAll(".code");
      const codeSet = new Set(data.codes);
      let passCounter = 0;
      for (let codeInput of codeInputs) {
        if (codeSet.has(codeInput.value)) {
          codeSet.delete(codeInput.value);
          codeInput.style.background = "green";
          passCounter++;
        } else {
          codeInput.style.background = "red";
        }
      }
      if (passCounter === codeInputs.length) {
        return dAgentId;
      }
    })
    .then((dAgentId) => {
      console.log(dAgentId);
      const data = new URLSearchParams();
      if (fetchType === "regions") {
        data.append("fetchType", fetchType);
      }
      data.append("dAgentId", dAgentId);
      return fetch("/secAgent/security/checkPassed", {
        body: data,
        method: "POST",
        headers: {
          "csrf-token": csrf,
        },
      });
    })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      if (data.message === "success") {
        alert("check passed");
        window.location.replace("/secAgent/dashBoard");
      } else {
        alert("check faild");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const secPkgs = document.getElementById("secPkgs");
if (secPkgs) {
  secPkgs.addEventListener("click", () => {
    securePackages();
  });
}

const getPackageData = () => {
  const barCode = document.querySelector("[name=barCode]").value;
  const csrf = document.querySelector("[name=_csrf]").value;
  const data = new URLSearchParams();
  data.append("barCode", barCode);
  fetch("/dAgent/packageData", {
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
      const inputArr = Object.keys(data.packageData).map((key) => {
        return data.packageData[key];
      });
      for (let inputData of inputArr) {
        const input = document.createElement("input");
        input.value = inputData;
        input.disabled = true;
        if (input.value === "Deliver(rejected)") {
          const select = document.getElementById("delivery");
          const opt = document.createElement("option");
          opt.value = "Returned-to-seller";
          opt.innerText = "معاد للبائع";
          select.append(opt);
        }
        pkgData.append(input);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const gtPkgDta = document.getElementById("gtPkgDta");
const barCode = document.querySelector("[name=barCode]");
if (barCode) {
  barCode.addEventListener("focus", async (e) => {
    const codeText = await navigator.clipboard.readText();
    e.target.value = codeText;
  });
}
if (gtPkgDta) {
  gtPkgDta.addEventListener("click", () => {
    getPackageData();
  });
}

const packageStatus = () => {
  const pkgStatus = document.querySelector(".pkgStatus").value;
  const barCode = document.querySelector("[name=barCode]").value;
  const csrf = document.querySelector("[name=_csrf]").value;
  const rejectionReason = document.querySelector("[name=rejectionReason]")
    .value;
  getLocation
    .then((loc) => {
      const data = new URLSearchParams();
      if (rejectionReason) {
        data.append("rejectionReason", rejectionReason);
      }
      data.append("status", pkgStatus);
      data.append("barCode", barCode);
      data.append("latitude", loc.lat);
      data.append("longitude", loc.long);
      fetch("/dAgent/packageStatus", {
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
          if (data.message === "success") {
            window.location.replace("/dAgent/dashBoard");
          }
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

const pkgStts = document.getElementById("pkgStts");
if (pkgStts) {
  pkgStts.addEventListener("click", () => {
    packageStatus();
  });
}

const trackPackage = () => {
  const barCode = document.querySelector("[name=barCode]").value;
  const csrf = document.querySelector("[name=_csrf]").value;
  const data = new URLSearchParams();
  data.append("barCode", barCode);
  fetch("/package/tracking", {
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
      const pkgDetails = document.getElementById("pkgDetails");
      const prices = document.getElementById("prices");
      const table = document.getElementById("trackingHistory");
      const gps = document.getElementById("gps");
      const tracker = data.package.tracker;
      for (let pInfo in data.package) {
        if (pInfo !== "tracker" && pInfo !== "_id" && pInfo !== "geoLocation") {
          if (prices.children.length === 2) {
            prices.innerHTML = "";
          }
          if (pInfo === "productPrice" || pInfo === "deliveryFee") {
            const p = document.createElement("p");
            p.innerText = data.package[pInfo];
            p.classList.add("productPrice");
            prices.append(p);
          }
          if (pkgDetails.children.length === 7) {
            pkgDetails.innerHTML = "";
            pkgDetails.append(prices);
          }
          const p = document.createElement("p");
          p.innerText = data.package[pInfo];
          p.classList.add("name");
          pkgDetails.append(p);
        }
      }
      if (data.package.geoLocation) {
        gps.href = `https://maps.google.com/maps/search/${data.package.geoLocation.latitude},${data.package.geoLocation.longitude}`;
        gps.target = "_blank";
        gps.innerText = "عرض الموقع الجغرافى";
      }
      table.innerHTML = "";
      for (let t of tracker) {
        const div = document.createElement("div");
        div.classList.add("table");
        let dateStr = t.transactionDate;
        const shortDate = dateStr.substr(0, dateStr.indexOf("."));
        const p1 = document.createElement("p");
        p1.innerText = shortDate;
        const p2 = document.createElement("p");
        p2.innerText = t.packagePosition;
        const p3 = document.createElement("p");
        p3.innerText = t.packageStatus;
        div.append(p1, p2, p3);
        table.append(div);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const trkPkg = document.getElementById("trkPkg");
if (trkPkg) {
  trkPkg.addEventListener("click", () => {
    trackPackage();
  });
}

const dropPackage = (btn) => {
  const csrf = btn.parentNode.parentNode.querySelector("[name=_csrf]").value;
  const card = btn.parentNode.parentNode.closest("div");
  const pkgId = document.querySelector("[name=pId]").value;
  const orderId = document.querySelector("[name=orderId]").value;
  const data = new URLSearchParams();
  data.append("pkgId", pkgId);
  data.append("orderId", orderId);
  fetch("/rAgent/dropPackage", {
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
      card.remove();
      if (data.message === "success") {
        alert("package removed!");
      }
      if (data.pkgArr.length <= 0) {
        window.location.reload();
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const drpPkgs = document.querySelectorAll(".drpPkg");
if (drpPkgs) {
  for (let i = 0; i < drpPkgs.length; ++i) {
    drpPkgs[i].addEventListener("click", (e) => {
      dropPackage(e.target);
    });
  }
}

const getTrackingCode = () => {
  const date = document.querySelector("[name=date]").value;
  const region = document.querySelector("[name=region]").value;
  const csrf = document.querySelector("[name=_csrf]").value;
  const data = new URLSearchParams();
  data.append("date", date);
  data.append("region", region);
  fetch("/packages/tracking/codes", {
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
      const table = document.getElementById("tbl");
      if (data.packages.length > 0) {
        table.innerHTML = "";
        for (let p of data.packages) {
          const div = document.createElement("div");
          div.classList.add("table");
          const p1 = document.createElement("p");
          p1.classList.add("name");
          p1.innerText = p.clientName;
          const p2 = document.createElement("p");
          p2.classList.add("address");
          p2.innerText = p.address;
          const a = document.createElement("a");
          a.classList.add("barcode");
          a.href = `/package/tracking/${p.barCode}`;
          const par = document.createElement("p");
          par.innerText = p.barCode;
          a.append(par);
          a.title = p.barCode;
          div.append(p1, p2, a);
          table.append(div);
        }
      } else {
        alert("No data found");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const gtTrkngCd = document.getElementById("gtTrkngCd");
if (gtTrkngCd) {
  gtTrkngCd.addEventListener("click", () => {
    getTrackingCode();
  });
}

const getOrderDetails = () => {
  const orderId = document.querySelector("[name=orderId]").value;
  const csrf = document.querySelector("[name=_csrf]").value;
  const data = new URLSearchParams();
  data.append("orderId", orderId);
  fetch("/cAgent/modifyOrder", {
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
      const table = document.getElementById("tbl");
      const id = document.querySelector("[name=id]");
      if (data.order) {
        table.innerHTML = "";
        const div = document.createElement("div");
        div.classList.add("table");
        const p1 = document.createElement("p");
        p1.classList.add("name");
        p1.innerText = data.order.sellerId.name;
        const p2 = document.createElement("p");
        p2.classList.add("address");
        p2.innerText = data.order.receivingRegion;
        id.value = data.order._id;
        div.append(p1, p2);
        table.append(div);
      } else {
        alert("No data found");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const gtOrdrId = document.getElementById("gtOrdrId");
if (gtOrdrId) {
  gtOrdrId.addEventListener("click", () => {
    getOrderDetails();
  });
}
