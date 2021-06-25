const countryTargets = [
  "Germany",
  "Italy",
  "England",
  "France",
  "Spain",
  "Portugal",
  "Netherlands",
];
const apiConfigObj = {
  method: "GET",
  headers: {
    "x-rapidapi-host": "v3.football.api-sports.io",
    "x-rapidapi-key": "8bc0ad048d98ed6fa090704ed786ca23"
  },
};
//Render list of countries and their flags
const countriesList = document.querySelector('#list-countries')
fetch(`https://v3.football.api-sports.io/countries`, apiConfigObj)
  .then((response) => response.json())
  .then((country) => {
    let countriesListBody = ''
    country.response.forEach((country) => {
      for (let i = 0; i < countryTargets.length; i++) {
        if (countryTargets[i] === country.name) {
          countriesListBody += 
          `
          <button class= "country btn btn-info">
            <img src=${country.flag} class = "rounded-circle">
            <span class="country-name">${countryTargets[i]}</span>
          </button>
          `
        }
      }
      countriesList.innerHTML = countriesListBody
    });
    const countries = document.getElementsByClassName("country");
    for (const country of countries) {
      country.addEventListener("click", function (e) {
        for (const country of countries) {
          country.className = "country btn btn-info"
        }
        country.className += " highlighted"
        rightSidebarDataOut()
        spinnerDisplayer('on','hidden','#coach')
        spinnerDisplayer('on','hidden','#venue')
        //Make sure it deletes all elements from content div except the dropdown
        let i = document.querySelector(".content").children.length - 1;
        while (i > 1) {
          document.querySelector(".content").children[i].remove();
          i--;
        }
        //Show season dropdown
        document.querySelector("label").style.display = "inline";
        document.querySelector("select").style.display = "inline";
        fetch(
          `https://v3.football.api-sports.io/leagues?country=${country.children[1].innerText}`,
          apiConfigObj
        )
          .then((resp) => resp.json())
          .then((leagues) => {
            //Season dropdown options (if later on I can't upload the table, check values!!)
            document.getElementById("season").innerHTML = "";
            leagues.response[0].seasons
              .reverse()
              .forEach(
                (season) =>
                  (document
                    .getElementById("season")
                    .appendChild(document.createElement("option")).textContent =
                    season.year)
              );

            //Render name and logo of first division league
            if (!!document.querySelector("#league-champion")) {
              querySelector("#league-champion").remove();
            }
            document
              .querySelector(".content")
              .appendChild(document.createElement("div"))
              .setAttribute("id", "league-champion");
            document.querySelector(
              "#league-champion"
            ).innerHTML = `
              <div id="league">
                <h3 id=${leagues.response[0].league.id}>${leagues.response[0].league.name}</h3>
                <img src=${leagues.response[0].league.logo} class = "rounded">
                </div>
                <div id="champion">
              </div>`;
              playerData()
            //Render the last champion team logo
            const leagueId = leagues.response[0].league.id;
            const season = document.querySelector("select");
            fetch(
              `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season.value}`,
              apiConfigObj
            )
              .then((resp) => resp.json())
              .then((standings) => {
                document.querySelector(
                  "#champion"
                ).innerHTML = `
                <h3>1st Place</h3>
                <img src=${standings.response[0].league.standings[0][0].team.logo}>`;
                //Render Table & Standings last season
                renderStandingsTable();
              })
              .catch(contentCatchError)
          });
        //Enable player lookup form
        document.querySelector('#player-name').disabled = false
        document.querySelector('#player button').disabled = false
        
      });
    }
    //Render champion team logo
    const season = document.querySelector("select");
    season.addEventListener("change", function () {
      rightSidebarDataOut()
      spinnerDisplayer('on','hidden','#coach')
      spinnerDisplayer('on','hidden','#venue')
      if (!!document.querySelectorAll("#league-champion img")[1]) {
        document.querySelectorAll("#league-champion img")[1].remove();
      }
      const leagueId = document.querySelector(
        "#league-champion h3:first-of-type"
      ).id;
      fetch(
        `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season.value}`,
        apiConfigObj)
        .then((resp) => resp.json())
        .then((standings) => {
          document.querySelector("#champion").innerHTML = `
          <h3>1st Place</h3>
          <img src=${standings.response[0].league.standings[0][0].team.logo}>`;
          //Render Table & Standings
          renderStandingsTable();         
        })
        .catch(contentCatchError)
    });
  });
function renderStandingsTable() {
  //Verify there is no table prior appending it
  if (!!document.querySelector("#standings")) {
    document.querySelector("#standings").remove()
    document.querySelector("#standings-qualifications").remove();
  }
  //Creation of the table headers
  document
    .querySelector(".content")
    .appendChild(document.createElement("table"))
    .setAttribute("id", "standings");
  document
    .querySelector("#standings").className = 'table table-striped table-hover .table-condensed table-responsive'
  document
    .querySelector("#standings").appendChild(document.createElement('thead')).className = 'table-head'
  document
    .querySelector("#standings thead")
    .innerHTML =
      `<tr>
        <th>Pos</th>
        <th class = "logos-header"> </th>
        <th>Team</th>
        <th>P</th>
        <th>W</th>
        <th>D</th>
        <th>L</th>
        <th>GF</th>
        <th>GA</th>
        <th>+/-</th>
        <th>PTS</th>
        <th>Last 5</th
      </tr>`
  
  //Creation of the table body
  document
    .querySelector("#standings").appendChild(document.createElement('tbody'))
  
  const leagueId = document.querySelector(
    "#league-champion h3:first-of-type"
  ).id;  
  const standingsData =  document
    .querySelector("#standings tbody")
  const season = document.querySelector("select");
  //Fetching to get the standings
  fetch(`https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season.value}`, apiConfigObj)
    .then(resp => resp.json())
    .then(standings => {
      console.log
      let standingsDataBody = ""
      for (let i=0; i<standings.response[0].league.standings[0].length; i++) {
        standingsDataBody += 
        `<tr>
          <td id = "rank">${standings.response[0].league.standings[0][i].rank}</td>
          <td><img src = ${standings.response[0].league.standings[0][i].team.logo}></td>
          <td id = "team-${standings.response[0].league.standings[0][i].team.id}" class = "team-name"><b>${standings.response[0].league.standings[0][i].team.name}</b></td>
          <td>${standings.response[0].league.standings[0][i].all.played}</td>
          <td>${standings.response[0].league.standings[0][i].all.win}</td>
          <td>${standings.response[0].league.standings[0][i].all.draw}</td>
          <td>${standings.response[0].league.standings[0][i].all.lose}</td>
          <td>${standings.response[0].league.standings[0][i].all.goals.for}</td>
          <td>${standings.response[0].league.standings[0][i].all.goals.against}</td>
          <td>${standings.response[0].league.standings[0][i].goalsDiff}</td>
          <td>${standings.response[0].league.standings[0][i].points}</td>
          <td>
            ${last5(standings.response[0].league.standings[0][i].form)[0]===undefined ? '' : last5(standings.response[0].league.standings[0][i].form)[0]}
            ${last5(standings.response[0].league.standings[0][i].form)[1]===undefined ? '' : last5(standings.response[0].league.standings[0][i].form)[1]}
            ${last5(standings.response[0].league.standings[0][i].form)[2]===undefined ? '' : last5(standings.response[0].league.standings[0][i].form)[2]}
            ${last5(standings.response[0].league.standings[0][i].form)[3]===undefined ? '' : last5(standings.response[0].league.standings[0][i].form)[3]}
            ${last5(standings.response[0].league.standings[0][i].form)[4]===undefined ? '' : last5(standings.response[0].league.standings[0][i].form)[4]}
          </td>
        </tr>`
      }
      standingsData.innerHTML = standingsDataBody
      for (let i=0; i<standings.response[0].league.standings[0].length; i++) {
        if (typeof(standings.response[0].league.standings[0][i].description) === 'string'){
          if (!!standings.response[0].league.standings[0][i].description.match('Champions League')) {
            document.querySelectorAll('tr #rank')[i].style.background = 'green'
          }
          if (!!standings.response[0].league.standings[0][i].description.match('Europa League')){
            document.querySelectorAll('tr #rank')[i].style.background = 'orange'
          }
          if (!!standings.response[0].league.standings[0][i].description.match('Relegation')){
            document.querySelectorAll('tr #rank')[i].style.background = 'red'
          }
        }
      }
      //Add table footer tags
      document
      .querySelector("#standings")
      .insertAdjacentHTML('afterend', 
      `<ul id= 'standings-qualifications'>
        <li id= "champions-league"> Qualify or play-offs to Champions League</li>
        <li id= "europa-league">Qualify or play-offs to Europa League</li>
        <li id= "relegation">Relegation or play-offs to stay in 1st division</li>
      </ul>`)
      renderTopScorersAndFacts()  
      renderCoachVenueFacts()
    })
    .catch(() => alert('Not yet available information'))
}
function renderTopScorersAndFacts() {
  if (!!document.querySelector("#facts-container")) {
    document.querySelector("#facts-container").remove();
  }
  document
    .querySelector(".content")
    .appendChild(document.createElement("div"))
    .setAttribute("id", "facts-container");
  //Verify there is no table prior appending it
  if (!!document.querySelector("#top-scorers")) {
    document.querySelector("#top-scorers").remove();
  }
  //Creation of the table headers
  document
    .querySelector("#facts-container")
    .appendChild(document.createElement("table"))
    .setAttribute("id", "top-scorers");
  document
    .querySelector("#top-scorers").className = 'table table-striped table-hover .table-condensed'
  document
    .querySelector("#top-scorers").appendChild(document.createElement('thead')).className = 'table-head'
  document
    .querySelector("#top-scorers thead")
  .innerHTML =
    `<tr>
      <th class = "logos-header"> </th>
      <th>Top 15 Scorers</th>
      <th>Goals</th>
    </tr>`
  //Creation of the table body
  document
  .querySelector("#top-scorers").appendChild(document.createElement('tbody'))
  const leagueId = document.querySelector(
    "#league-champion h3:first-of-type"
  ).id; 
  const season = document.querySelector("select");
  const topScorersData =  document
  .querySelector("#top-scorers tbody")
  //Fetching to get the standings
  fetch(`https://v3.football.api-sports.io/players/topscorers?league=${leagueId}&season=${season.value}`, apiConfigObj)
    .then(resp => resp.json())
    .then(topScorers => {
      let topScorersDataBody = ""
      for (let i=0; i<15; i++) {
        topScorersDataBody += 
        `<tr>
          <td><img src = ${topScorers.response[i].statistics[0].team.logo}></td>
          <td>${topScorers.response[i].player.name}</td>
          <td>${topScorers.response[i].statistics[0].goals.total}</td>
        </tr>`
      }
      topScorersData.innerHTML = topScorersDataBody
    })
  document.querySelector('#facts-container').appendChild(document.createElement('div')).setAttribute('id','more-facts')
  renderLeagueFactsServer('largest_streak_wins','max')
  renderLeagueFactsServer('largest_streak_draws','max')
  renderLeagueFactsServer('largest_streak_loses','max')
  renderLeagueFactsServer('penalty','max')
  renderLeagueFactsServer('penalty','min')
  renderLeagueFactsServer('clean_sheet','max')
}
function renderLeagueFacts(streakType,type) {
  /* streakType options: 
    -largest_streak_wins
    -largest_streak_draws
    -largest_streak_loses 
    -penalty
    -clean_sheet
    type options:
    -max, else min */
  const season = document.querySelector("select")
  const leagueId = document.querySelector(
    "#league-champion h3:first-of-type"
  ).id;
  const leagueFacts = {}
  const teamNames = []
  const streakTeams = []
  const teamsTable = document.querySelectorAll('#standings tbody tr')
  for (let i=0; i<teamsTable.length;i++) {
    fetch(`https://v3.football.api-sports.io/teams/statistics?season=${season.value}&team=${teamsTable[i].children[2].id.split('-')[1]}&league=${leagueId}`, apiConfigObj)
      .then(resp => resp.json())
      .then(teamStats => {
        const factsList = {
          largest_streak_wins: teamStats.response.biggest.streak.wins,
          largest_streak_draws: teamStats.response.biggest.streak.draws,
          largest_streak_loses: teamStats.response.biggest.streak.loses,
          best_win_home: teamStats.response.biggest.wins.home,
          best_win_away: teamStats.response.biggest.wins.away,
          worst_lose_home: teamStats.response.biggest.loses.home,
          worst_lose_away: teamStats.response.biggest.loses.away,
          clean_sheet: teamStats.response.clean_sheet.total,
          penalty: teamStats.response.penalty.total
        }
        teamNames.push(teamsTable[i].children[2].textContent)
        leagueFacts[teamsTable[i].children[2].textContent] = factsList
        if (i>=teamsTable.length-1) {
          const streak = teamNames.map(team => leagueFacts[team][streakType])
          const biggestStreak = (type === 'max') ? Math.max(...streak) : Math.min(...streak)
          for (team of teamNames) {
            if (leagueFacts[team][streakType] === biggestStreak) {
              streakTeams.push(team)
            }
          }
          if (streakType === 'largest_streak_wins' && type === 'max') {
            renderStreakTeams('Largest Win Streak',biggestStreak, streakTeams)
          }
          if (streakType === 'largest_streak_draws' && type === 'max') {
            renderStreakTeams('Largest Draw Streak',biggestStreak, streakTeams)
          }
          if (streakType === 'largest_streak_loses' && type === 'max') {
            renderStreakTeams('Largest Lose Streak',biggestStreak, streakTeams)
          }
          if (streakType === 'penalty' && type === 'max') {
            renderStreakTeams('Most Penalties Conceded',biggestStreak, streakTeams)
          }
          if (streakType === 'penalty' && type === 'min') {
            renderStreakTeams('Fewest Penalties Conceded',biggestStreak, streakTeams)
          }
          if (streakType === 'clean_sheet' && type === 'max') {
            renderStreakTeams('Most Clean Sheets',biggestStreak, streakTeams)
          } 
        }
    })
  }
}
function renderCoachVenueFacts() {
  document.querySelectorAll('#standings tbody tr')
  .forEach((team)=> {
    team.addEventListener('click', ()=> {
      
      rightSidebarDataOut()
      //Prevent element to be event listened while fetching
      team.style.pointerEvents = 'none' 
      //Display loading spinner
      spinnerDisplayer('on','visible','#coach')
      //Fetch coach
      fetch(`https://v3.football.api-sports.io/coachs?team=${team.children[2].id.split('-')[1]}`,apiConfigObj)
        .then(resp => resp.json())
        .then(coaches => {
          document.querySelector('#coach').appendChild(document.createElement('img')).setAttribute('src',`${coaches.response[0].photo}`)
          document.querySelector("#coach img").className = "rounded-circle"
          document.querySelector('#coach').appendChild(document.createElement('p')).textContent = `${coaches.response[0].name}`
          team.style.pointerEvents = 'auto' //Allows element to be event listened after fetiching
          //Don't display loading spinner
          spinnerDisplayer('off','hidden','#coach')
        })
      
      rightSidebarDataOut()
      //Display loading spinner
      spinnerDisplayer('on','visible','#venue')
       //Fetch team venue
      fetch(`https://v3.football.api-sports.io/teams?id=${team.children[2].id.split('-')[1]}`,apiConfigObj)
        .then(resp => resp.json())
        .then(teamInfo => {
          document.querySelector('#venue').appendChild(document.createElement('img')).setAttribute('src',`${teamInfo.response[0].venue.image}`)
          document.querySelector("#venue img").className = "rounded"
          document.querySelector('#venue').appendChild(document.createElement('p')).textContent = `${teamInfo.response[0].venue.name}`
          team.style.pointerEvents = 'auto' //Allows element to be event listened after fetiching
          //Don't display loading spinner
          spinnerDisplayer('off','hidden','#venue')
        })
    })
  })
}
function last5(results) {
  //Returns image link related to the result of the match
  return results.split('').map(char => {
    switch (char) {
      case 'W': char = '<img src="./img/win.svg">'
        break
      case 'D': char = '<img src="./img/draw.svg">'
        break
      case 'L': char = '<img src="./img/lose.svg">'
    }
    return char
  })
}
function spinnerDisplayer(mode,visibility,parentSelector) {
  //Displays or hides a loading spinner
  if (mode === 'on') {
    document.querySelector(`${parentSelector} .spinner-border`).style.display = 'block'
    document.querySelector(`${parentSelector} .spinner-border`).style.visibility = `${visibility}`
  } else if (mode === 'off') {
    document.querySelector(`${parentSelector} .spinner-border`).style.visibility = `${visibility}`
    document.querySelector(`${parentSelector} .spinner-border`).style.display = 'none'
  }
}
function contentCatchError() {
  //Removes required information that client must not see in case there isn't data to fetch
  if (!!document.querySelector('#standings')) {
    document.querySelector('#standings').nextSibling.remove()
    document.querySelector('#standings').remove()
  }
  if (!!document.querySelector('#champion')) {
    document.querySelector('#champion').innerHTML = ''
  }
  alert('COMING SOON!!!')
}
function rightSidebarDataOut() {
  //Removes all the data from the right sidebar
  
  //Remove country and team text requests if exist
  if (!!document.querySelector("#coach p")) {
    document.querySelector('#coach p').remove()
  }
  //Verify there is no images or names prior appending them
  if (!!document.querySelector('#coach img')) {
    document.querySelector("#coach img").remove();
  }
  //Remove country and team text requests if exist
  if (!!document.querySelector("#venue p")) {
    document.querySelector('#venue p').remove()
  }
  //Verify there is no images or names prior appending them
  if (!!document.querySelector("#venue img")) {
    document.querySelector('#venue img').remove()
  }
}
function playerData() {
  const leagueId = document.querySelector(
    "#league-champion h3:first-of-type"
  ).id;
  const playerName = document.querySelector('#player-name')
  const submitPlayer = document.querySelector('#player form')
  submitPlayer.addEventListener('submit', (e)=> {
    e.preventDefault()
    console.log(playerName.value.length)
    if (playerName.value.length < 4) {
      alert('I need at least 4 characters. Try again :)')
    } else {
      fetch(`https://v3.football.api-sports.io/players?search=${playerName.value}&league=${leagueId}`, apiConfigObj)
        .then(resp => resp.json())
        .then(players => {
          console.log(players.response[0])
          document.querySelector('#player').appendChild(document.createElement('div')).setAttribute('id','player-img')
          document.querySelector('#player-img').innerHTML = 
          `<img src="https://media.api-sports.io/football/players/${players.response[0].player.id}.png">
          <ul>
          <li>First Name: <b>${players.response[0].player.firstname}</b></li>
          <li>Surname: <b>${players.response[0].player.lastname}</b></li>
          <li>Age: <b>${players.response[0].player.age}</b></li>
          </ul>
          <p>This player was born in ${players.response[0].player.birth.place}, ${players.response[0].player.birth.country}, and plays for ${players.response[0].statistics[0].team.name} as ${players.response[0].statistics[0].games.position}.`
          playerName.value = ''
      })
    }
  })
}
function renderLeagueFactsServer(streakType,type) {
  /* streakType options: 
    -largest_streak_wins
    -largest_streak_draws
    -largest_streak_loses 
    -penalty
    -clean_sheet
    type options:
    -max, else min */
  const leagueId = document.querySelector(
    "#league-champion h3:first-of-type"
  ).id;
  const leagueFacts = {}
  const teamNames = []
  const streakTeams = []
  if (document.querySelector("select").value === '2020') {
    fetch(`http://localhost:3000/${leagueId}`, apiConfigObj)
      .then(resp => resp.json())
      .then(teamStats => {
        for (team in teamStats) {
          const factsList = {
            largest_streak_wins: teamStats[team].biggest.streak.wins,
            largest_streak_draws: teamStats[team].biggest.streak.draws,
            largest_streak_loses: teamStats[team].biggest.streak.loses,
            best_win_home: teamStats[team].biggest.wins.home,
            best_win_away: teamStats[team].biggest.wins.away,
            worst_lose_home: teamStats[team].biggest.loses.home,
            worst_lose_away: teamStats[team].biggest.loses.away,
            clean_sheet: teamStats[team].clean_sheet.total,
            penalty: teamStats[team].penalty.total
          }
          teamNames.push(team)
          leagueFacts[team] = factsList
        }
        const streak = teamNames.map(team => leagueFacts[team][streakType])
        const biggestStreak = (type === 'max') ? Math.max(...streak) : Math.min(...streak)
        for (team of teamNames) {
          if (leagueFacts[team][streakType] === biggestStreak) {
            streakTeams.push(team)
          }
        }
        if (streakType === 'largest_streak_wins' && type === 'max') {
          renderStreakTeams('Largest Win Streak',biggestStreak, streakTeams)
        }
        if (streakType === 'largest_streak_draws' && type === 'max') {
          renderStreakTeams('Largest Draw Streak',biggestStreak, streakTeams)
        }
        if (streakType === 'largest_streak_loses' && type === 'max') {
          renderStreakTeams('Largest Lose Streak',biggestStreak, streakTeams)
        }
        if (streakType === 'penalty' && type === 'max') {
          renderStreakTeams('Most Penalties Conceded',biggestStreak, streakTeams)
        }
        if (streakType === 'penalty' && type === 'min') {
          renderStreakTeams('Fewest Penalties Conceded',biggestStreak, streakTeams)
        }
        if (streakType === 'clean_sheet' && type === 'max') {
          renderStreakTeams('Most Clean Sheets',biggestStreak, streakTeams)
        } 
    })
  } 
}
function renderStreakTeams(tableHeader,biggestStreak, streakTeams) {
  document.querySelector('#more-facts').appendChild(document.createElement('div')).innerHTML = 
    `<table class = "facts-info table table-bordered table-hover .table-condensed">
      <tr>
        <th colspan='2' class = "facts-header">${tableHeader}</th>
      </tr>
      <tr>
        <td class="biggest-streak"><strong>${biggestStreak}</strong></td>
        <td class="streak-team"></td>
      </tr>
    </table>`
    streakTeams.forEach(team => {
      document.querySelectorAll('.biggest-streak')[document.querySelectorAll('.biggest-streak').length-1].setAttribute('rowspan',`${streakTeams.length}`)
      document.querySelectorAll('.streak-team')[document.querySelectorAll('.streak-team').length-1].appendChild(document.createElement('tr')).innerHTML = `<li>${team}</li>`
  })
}
function statisticsCombiner() {
  //Creates json data about league facts
  const leagueId = document.querySelector(
    "#league-champion h3:first-of-type"
  ).id;
  const teamNames = []
  const teamsTable = document.querySelectorAll('#standings tbody tr')
  const consolidated = []
  const objectFinal = {}
  for (let i=0; i<teamsTable.length;i++) {
    fetch(`https://v3.football.api-sports.io/teams/statistics?season=2020&team=${teamsTable[i].children[2].id.split('-')[1]}&league=${leagueId}`, apiConfigObj)
      .then(resp => resp.json())
      .then(teamStats => {
        console.log(teamStats)
        teamNames.push(teamsTable[i].children[2].textContent)
        consolidated.push(teamStats.response)
        if (i>=teamsTable.length-1) {
          for (let i = 0; i < teamNames.length; i++) {
            objectFinal[teamNames[i]] = consolidated[i]
          }
          
        }
        console.log(objectFinal)
    })
  }
}