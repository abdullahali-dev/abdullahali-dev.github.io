function Init() {
  let gameInfo = {};
  let gameHistory = localStorage.getItem("gameHistory");
  if (gameHistory == null) {
    NewGame(false);
  } else {
    gameHistory = JSON.parse(gameHistory);
    gameHistory = gameHistory.sort((x, y) => y.gameDate - x.gameDate);
    gameInfo = gameHistory[0];
    window.Players = gameInfo.players;
  }
  populatePlayersTable();
}

function NewGame(askConfirm = true, players = []) {
  if (askConfirm) {
    let confirm = window.confirm("هل انت متأكد !");
    if (!confirm) {
      return;
    }
  }
  let gameHistory = localStorage.getItem("gameHistory");
  if (gameHistory != null) {
    gameHistory = JSON.parse(gameHistory);
  } else {
    gameHistory = [];
  }
  validGamesHistory = [];
  for (let i = 0; i < gameHistory.length; i++) {
    if (gameHistory[i].players.length > 0) {
      validGamesHistory.push(gameHistory[i]);
    }
  }
  gameHistory = validGamesHistory;
  let currentDate = new Date();
  gameInfo = {
    gameId: Date.now(),
    gameDate: currentDate.toISOString().split("T")[0],
    players: players,
  };
  gameHistory.push(gameInfo);
  localStorage.setItem("gameHistory", JSON.stringify(gameHistory));
  window.Players = gameInfo.players;
  populatePlayersTable();
}

function UpdateCurrentGame() {
  let gameHistory = localStorage.getItem("gameHistory");
  gameHistory = JSON.parse(gameHistory);
  gameHistory = gameHistory.sort((x, y) => y.gameDate - x.gameDate);
  gameHistory[0].players = window.Players;
  localStorage.setItem("gameHistory", JSON.stringify(gameHistory));
}

function AddPlayer() {
  let id = window.Players.length + 1;
  let name = document.getElementById("PlayerNameInput");
  if (name.value == "") {
    name.style.borderColor = "red";
    name.focus();
    return;
  } else {
    name.style.borderColor = "#ced4da";
  }
  window.Players.push({
    ID: id,
    Name: name.value,
    Score: 0,
  });
  name.value = "";
  populatePlayersTable();
}

function InitAction(actionType) {
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
      arActionName = "سوبر هند";
      break;
    case "FullHand":
      multipleBy = 3;
      isHandType = true;
      arActionName = "فل هند";
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
  for (let i = 0; i < window.Players.length; i++) {
    //tr
    let tr = document.createElement("tr");
    tr.id = "input-tr-" + window.Players[i].ID;

    //Name
    let tdName = document.createElement("td");
    tdName.innerText = window.Players[i].Name;
    tr.appendChild(tdName);

    //Score
    let tdScore = document.createElement("td");
    inputScore = document.createElement("input");
    let inputId = "input-box-" + window.Players[i].ID;
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
    let plus50Id = "plus-btn-" + window.Players[i].ID;
    if (isHandType) {
      let plus50 = document.createElement("button");
      plus50.id = plus50Id;
      plus50.addEventListener("click", function (e) {
        document.getElementById(inputId).value = 50 * multipleBy + actionScore;
        let plusBtns = document.getElementsByClassName("plus-btn");
        for (let i = 0; i < plusBtns.length; i++) {
          plusBtns[i].disabled = true;
          plusBtns[i].classList = ["btn btn-secondary mx-1 plus-btn"];
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
        actionBtns[i].classList = ["btn btn-secondary action-btn"];
      }
    });
    actionBtn.classList = ["btn btn-success action-btn"];
    actionBtn.innerText = arActionName;
    tdActions.appendChild(actionBtn);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  }
  $("#PlayersInputModal").modal("toggle");
}

function doAction(isAddPlayer = true) {
  for (let i = 0; i < window.Players.length; i++) {
    let playerID = window.Players[i].ID;
    let input = document.getElementById("input-box-" + playerID);
    if (input.value.match("^[0-9]+$")) {
      window.Players[i].Score += parseInt(input.value);
    }
  }
  populatePlayersTable();

  if (!isAddPlayer) {
    $("#PlayersInputModal").modal("toggle");
  }
}

function populatePlayersTable() {
  window.Players = window.Players.sort((x, y) => Number(y.Score) - Number(x.Score));
  let tbody = document.getElementById("PlayersTbody");
  tbody.innerHTML = "";
  for (let i = 0; i < window.Players.length; i++) {
    let playerID = window.Players[i].ID;
    let tr = document.createElement("tr");
    let tdSort = document.createElement("td");
    let tdName = document.createElement("td");
    let tdScore = document.createElement("td");

    tr.id = playerID;

    tdSort.innerText = i + 1;
    tdSort.style.textAlign = "center";

    tdName.innerText = window.Players[i].Name;

    tdScore.innerText = window.Players[i].Score;
    tdScore.style.textAlign = "center";

    tr.appendChild(tdSort);
    tr.appendChild(tdName);
    tr.appendChild(tdScore);
    tbody.appendChild(tr);
  }
  UpdateCurrentGame();
}
function populateHistory() {
  let tbody = document.getElementById("HistoryTbody");
  tbody.innerHTML = "";
  let gameHistory = localStorage.getItem("gameHistory");
  if (gameHistory == null) {
    alert("لا يوجد العاب سابقة");
    return;
  }
  gameHistory = JSON.parse(gameHistory);
  for (let i = 0; i < gameHistory.length; i++) {
    if(gameHistory[i].players.length < 1){
        continue;
    }
    let tr = document.createElement("tr");
    let tdDate = document.createElement("td");
    let tdPlayersCount = document.createElement("td");
    let tdReuse = document.createElement("td");
    let btnReuse = document.createElement("button");

    tr.id = gameHistory[i].gameId;
    tdDate.innerText = gameHistory[i].gameDate;
    tdPlayersCount.innerText = gameHistory[i].players.length;
    btnReuse.innerText = "استعادة";
    btnReuse.addEventListener("click",function(e){
        let history = JSON.parse(localStorage.getItem("gameHistory"));
        let restoreGame = history.find((x)=>x.gameId == gameHistory[i].gameId );
        NewGame(true,restoreGame.players);
        document.getElementById("PlayersTable").style.display = "table";
        document.getElementById("HistoryTable").style.display = "none";
    });
    btnReuse.classList = ['btn btn-primary btn-sm'];
    tdReuse.appendChild(btnReuse);

    tr.appendChild(tdDate);
    tr.appendChild(tdPlayersCount);
    tr.appendChild(tdReuse);
    tbody.appendChild(tr);
  }
  document.getElementById("PlayersTable").style.display = "none";
  document.getElementById("HistoryTable").style.display = "table";
}
