function Init() {
  "use strict";

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }

  // let title = document.getElementById("title");
  // window.isTitleHold = false;
  // window.titleHoldTimeoutId = null;
  // ["mousedown", "touchstart"].forEach((eventType) => {
  //   title.addEventListener(eventType, function (e) {
  //     e.preventDefault();
  //     window.isTitleHold = true;
  //     window.titleHoldTimeoutId = setTimeout(() => {
  //       if (window.isTitleHold) {
  //         $("#overlayImage").modal("toggle");
  //       }
  //     }, 1000);
  //   });
  // });

  // ["mouseup", "mouseleave", "mouseout", "touchend", "touchcancel"].forEach((eventType) => {
  //   title.addEventListener(eventType, function () {
  //     window.isTitleHold = false;
  //     clearTimeout(window.titleHoldTimeoutId);
  //   });
  // });

  document.addEventListener("gesturestart", function (e) {
    e.preventDefault();
    // special hack to prevent zoom-to-tabs gesture in safari
    document.body.style.zoom = 0.99;
  });

  document.addEventListener("gesturechange", function (e) {
    e.preventDefault();
    // special hack to prevent zoom-to-tabs gesture in safari
    document.body.style.zoom = 0.99;
  });

  document.addEventListener("gestureend", function (e) {
    e.preventDefault();
    // special hack to prevent zoom-to-tabs gesture in safari
    document.body.style.zoom = 0.99;
  });

  $("#NewGameBtn").popover({
    content: "اضغط هنا للبدء",
    trigger: "manual",
  });

  let gameInfo = localStorage.getItem("gameInfo");
  if (gameInfo != null) {
    gameInfo = JSON.parse(gameInfo);
    window.gameInfo = gameInfo;
    PopulatePlayersTable();
  } else {
    document.getElementById("PlayersTable").style.display = "none";
    document.getElementById("NewGameBtn").focus();
    $("#NewGameBtn").popover("show");
    setTimeout(function () {
      $("#NewGameBtn").popover("hide");
    }, 3000);
  }
}

function NewGame(askConfirm = true) {
  if (askConfirm && window.gameInfo != undefined) {
    let confirm = window.confirm("هل انت متأكد !");
    if (!confirm) {
      return;
    }
  }
  let maxScore = window.prompt("الحد الأعلى للنقاط");
  if (maxScore == null || !maxScore.match("^[0-9]+$")) {
    alert("يجب ادخال رقم صحيح");
    return;
  }
  let gameInfo = localStorage.getItem("gameInfo");
  let players = [];
  if (gameInfo != null) {
    gameInfo = JSON.parse(gameInfo);
    players = gameInfo.players;
    players.forEach((player) => {
      player.Score = 0;
    });
  }
  let currentDate = new Date();
  gameInfo = {
    gameId: Date.now(),
    gameDate: currentDate.toISOString().split("T")[0],
    maxScore: parseInt(maxScore),
    players: players,
  };
  localStorage.setItem("gameInfo", JSON.stringify(gameInfo));
  window.gameInfo = gameInfo;
  PopulatePlayersTable();
  document.getElementById("PlayersTable").style.display = "table";
}

function UpdateCurrentGame() {
  let gameInfo = localStorage.getItem("gameInfo");
  gameInfo = JSON.parse(gameInfo);
  gameInfo.players = window.gameInfo.players;
  localStorage.setItem("gameInfo", JSON.stringify(gameInfo));
}

function AddPlayer() {
  let name = document.getElementById("PlayerNameInput");
  if (name.value == "") {
    name.style.borderColor = "red";
    name.focus();
    return;
  } else {
    name.style.borderColor = "#ced4da";
  }
  localStorage.setItem("gameInfoBackup", localStorage.getItem("gameInfo"));
  window.gameInfo.players.push({
    ID: Date.now(),
    Name: name.value,
    Score: 0,
  });
  name.value = "";
  UpdateCurrentGame();
  PopulatePlayersTable();
}

function InitAction(actionType) {
  if (localStorage.getItem("gameInfo") == null) {
    document.getElementById("NewGameBtn").focus();
    $("#NewGameBtn").popover("show");
    setTimeout(function () {
      $("#NewGameBtn").popover("hide");
    }, 3000);
    return;
  }
  window.gameInfo.players = window.gameInfo.players.sort((x, y) => x.ID - y.ID);
  let playersList = window.gameInfo.players.filter((player) => player.Score < window.gameInfo.maxScore);
  let firstPlayerID = [...playersList].sort((x,y) => x.Score - y.Score)[0].ID
  let multipleBy = 1;
  let isHandType = false;
  let arActionName = "";
  switch (actionType) {
    case "Hand":
      multipleBy = 1;
      isHandType = true;
      arActionName = "هند";
      break;
    case "SuperHand":
      multipleBy = 2;
      isHandType = true;
      arActionName = "سوبر";
      break;
    case "FullHand":
      multipleBy = 3;
      isHandType = true;
      arActionName = "فلل ";
      break;
    case "Finished":
      multipleBy = 1;
      isHandType = false;
      arActionName = "خالص";
      break;
  }
  let loserNum = isHandType == true ? 200 : 100;
  let winnerNum = isHandType == true ? -60 : -30;
  let actionScore = loserNum * multipleBy;

  let tbody = document.getElementById("PlayersInputTbody");
  tbody.innerHTML = "";
  tbody.dataset.actionType = actionType;
  for (let i = 0; i < playersList.length; i++) {
    //tr
    let tr = document.createElement("tr");
    tr.id = "input-tr-" + playersList[i].ID;
    // if(firstPlayerID == playersList[i].ID){
    //   tr.classList.add("border")
    //   tr.classList.add("border-success")
    // }

    //Name
    let tdName = document.createElement("td");
    tdName.innerText = playersList[i].Name;
    if(firstPlayerID == playersList[i].ID){
      tdName.classList.add("text-success")
      tdName.classList.add("font-weight-bold")
    }
    tr.appendChild(tdName);

    //Score
    let tdScore = document.createElement("td");
    inputScore = document.createElement("input");
    let inputId = "input-box-" + playersList[i].ID;
    inputScore.id = inputId;
    inputScore.value = actionScore;
    inputScore.type = "tel";
    inputScore.addEventListener("click", function (e) {
      e.target.value = "";
    });
    tdScore.appendChild(inputScore);
    tr.appendChild(tdScore);

    let tdActions = document.createElement("td");

    //Plus Btn
    let plus50Id = "plus-btn-" + playersList[i].ID;
    if (isHandType) {
      let plus50 = document.createElement("button");
      plus50.id = plus50Id;
      plus50.addEventListener("click", function (e) {
        input = document.getElementById(inputId);
        let currentVal = 0;
        if (input.value.match("^-?[0-9]+$")) {
          currentVal = parseInt(input.value);
        }
        document.getElementById(inputId).value = currentVal + 50 * multipleBy;
        let plusBtns = document.getElementsByClassName("plus-btn");
        for (let i = 0; i < plusBtns.length; i++) {
          plusBtns[i].disabled = true;
          plusBtns[i].classList.remove("btn-primary");
          plusBtns[i].classList.add("btn-secondary");
        }
      });
      plus50.classList = ["btn btn-primary mx-1 plus-btn"];
      plus50.innerText = "+" + 50 * multipleBy;
      tdActions.appendChild(plus50);
    }

    // Action Btn
    let actionBtn = document.createElement("button");
    actionBtn.addEventListener("click", function (e) {
      document.getElementById(inputId).value = winnerNum * multipleBy;
      if (isHandType) {
        document.getElementById(plus50Id).disabled = true;
        document.getElementById(plus50Id).classList = ["btn btn-secondary mx-1 plus-btn"];
      }
      let actionBtns = document.getElementsByClassName("action-btn");
      for (let i = 0; i < actionBtns.length; i++) {
        actionBtns[i].disabled = true;
        actionBtns[i].classList.remove("btn-success");
        actionBtns[i].classList.add("btn-secondary");
      }
    });
    actionBtn.classList = ["btn btn-success action-btn"];
    actionBtn.innerText = arActionName;
    tdActions.appendChild(actionBtn);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  }
  $("#PlayersInputModal").modal("show");
}
function ReInitAction() {
  let playersInputTbody = document.getElementById("PlayersInputTbody");
  if (playersInputTbody.dataset.actionType != undefined && playersInputTbody.dataset.actionType != null) {
    InitAction(playersInputTbody.dataset.actionType);
  }
}
function DoAction() {
  let gameInfo = localStorage.getItem("gameInfo");
  gameInfo = JSON.parse(gameInfo);
  localStorage.setItem("gameInfoBackup", JSON.stringify(gameInfo));
  let playersList = window.gameInfo.players.filter((player) => player.Score < window.gameInfo.maxScore);
  for (let i = 0; i < playersList.length; i++) {
    let playerID = playersList[i].ID;
    let input = document.getElementById("input-box-" + playerID);
    if (input != null && input.value.match("^-?[0-9]+$")) {
      let playerIdx = window.gameInfo.players.findIndex((x) => x.ID == playerID);
      window.gameInfo.players[playerIdx].Score += parseInt(input.value);
    }
  }
  //   window.gameInfo.players = window.gameInfo.players.filter((player) => player.Score < window.gameInfo.maxScore);
  UpdateCurrentGame();
  PopulatePlayersTable();

  $("#PlayersInputModal").modal("toggle");
}
function Undo() {
  let gameBackup = localStorage.getItem("gameInfoBackup");
  if (gameBackup != null) {
    gameBackup = JSON.parse(gameBackup);
    window.gameInfo.players = gameBackup.players;
    UpdateCurrentGame();
    PopulatePlayersTable();
  }
}

function PopulatePlayersTable() {
  window.gameInfo.players = window.gameInfo.players.sort((x, y) => Number(x.Score) - Number(y.Score));
  let playersList = window.gameInfo.players.filter((player) => player.Score < window.gameInfo.maxScore);
  let tbody = document.getElementById("PlayersTbody");
  tbody.innerHTML = "";
  for (let i = 0; i < playersList.length; i++) {
    let playerID = playersList[i].ID;

    let tr = document.createElement("tr");
    tr.id = playerID;

    let tdSort = document.createElement("td");
    tdSort.innerText = i + 1;

    let tdName = document.createElement("td");
    tdName.innerText = playersList[i].Name;

    let tdScore = document.createElement("td");
    tdScore.innerText = playersList[i].Score;

    let btnDel = document.createElement("button");
    btnDel.innerText = "X";
    btnDel.classList = ["btn-colse text-danger float-left d-inline"];
    btnDel.style.marginLeft = "2px";
    btnDel.dataset.id = playerID;
    btnDel.addEventListener("click", function (e) {
      if (confirm("هل انت متأكد ؟")) {
        localStorage.setItem("gameInfoBackup", localStorage.getItem("gameInfo"));
        window.gameInfo.players = window.gameInfo.players.filter((player) => player.ID != e.currentTarget.dataset.id);
        UpdateCurrentGame();
        PopulatePlayersTable();
      }
    });

    let tdDel = document.createElement("td");
    tdDel.appendChild(btnDel);
    if (playersList.length > 1 && playersList.filter((x) => x.Score != 0).length > 0) {
      if (i == playersList.length - 2) {
        let span = document.createElement("span");
        span.classList = ["badge badge-warning float-right"];
        span.style.verticalAlign = "middle";
        span.innerText = "يجرش";
        tdDel.appendChild(span);
      }
      if (i == playersList.length - 1) {
        let span = document.createElement("span");
        span.classList = ["badge badge-warning float-right"];
        span.style.verticalAlign = "middle";
        span.innerText = "يوزع";
        tdDel.appendChild(span);
      }
    }

    tr.appendChild(tdSort);
    tr.appendChild(tdName);
    tr.appendChild(tdScore);
    tr.appendChild(tdDel);
    tbody.appendChild(tr);
  }

  UpdateCurrentGame();
  PopulateLosersTable();
}

function PopulateLosersTable() {
  let playersList = window.gameInfo.players.filter((player) => player.Score >= window.gameInfo.maxScore);
  if (playersList.length > 0) {
    let tbody = document.getElementById("LosersTbody");
    tbody.innerHTML = "";
    for (let i = 0; i < playersList.length; i++) {
      let tr = document.createElement("tr");
      let tdName = document.createElement("td");
      tdName.innerText = playersList[i].Name;
      let tdScore = document.createElement("td");
      tdScore.innerText = playersList[i].Score;
      tr.appendChild(tdName);
      tr.appendChild(tdScore);
      tbody.appendChild(tr);
    }
    document.getElementById("LosersTable").style.display = "table";
  } else {
    document.getElementById("LosersTable").style.display = "none";
  }
}
