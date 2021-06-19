const countryTargets = [
  "Germany",
  "Italy",
  "England",
  "France",
  "Spain",
  "Portugal",
  "Netherlands",
];
const apiCongigObj = {
  method: "GET",
  headers: {
    "x-rapidapi-host": "v3.football.api-sports.io",
    "x-rapidapi-key": "8bc0ad048d98ed6fa090704ed786ca23",
  },
};
//Render list of countries and their flags
let countriesList = document.querySelector('#list-countries')
fetch(`https://v3.football.api-sports.io/countries`, apiCongigObj)
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
          apiCongigObj
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

            //Render the last champion team logo
            let leagueId = leagues.response[0].league.id;
            let season = document.querySelector("select");
            fetch(
              `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season.value}`,
              apiCongigObj
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
                renderTopScorers()
              }).catch(() => alert('Not yet available information for this season'))
          });
      });
    }
    //Render champion team logo
    let season = document.querySelector("select");
    season.addEventListener("change", function () {
      if (!!document.querySelectorAll("#league-champion img")[1]) {
        document.querySelectorAll("#league-champion img")[1].remove();
      }
      let leagueId = document.querySelector(
        "#league-champion h3:first-of-type"
      ).id;
      fetch(
        `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season.value}`,
        apiCongigObj
      )
        .then((resp) => resp.json())
        .then((standings) => {
          document.querySelector("#champion").innerHTML = `
          <h3>1st Place</h3>
          <img src=${standings.response[0].league.standings[0][0].team.logo}>`;

          //Render Table & Standings
          renderStandingsTable();
          renderTopScorers()         
        }).catch(() => alert('Not yet available information for this season'))
    });
  });

function renderStandingsTable() {
  //Verify there is no table prior appending it
  if (!!document.querySelector("#standings")) {
    document.querySelector("#standings").remove();
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
  
  let leagueId = document.querySelector(
    "#league-champion h3:first-of-type"
  ).id;  
  let standingsData =  document
    .querySelector("#standings tbody")
  let season = document.querySelector("select");
  //Fetching to get the standings
  fetch(`https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season.value}`, apiCongigObj)
    .then(resp => resp.json())
    .then(standings => {
      let standingsDataBody = ""
      for (let i=0; i<standings.response[0].league.standings[0].length; i++) {
        standingsDataBody += 
        `<tr>
          <td>${standings.response[0].league.standings[0][i].rank}</td>
          <td><img src = ${standings.response[0].league.standings[0][i].team.logo}></td>
          <td id = "team-${standings.response[0].league.standings[0][i].team.id}" class = "team-name">${standings.response[0].league.standings[0][i].team.name}</td>
          <td>${standings.response[0].league.standings[0][i].all.played}</td>
          <td>${standings.response[0].league.standings[0][i].all.win}</td>
          <td>${standings.response[0].league.standings[0][i].all.draw}</td>
          <td>${standings.response[0].league.standings[0][i].all.lose}</td>
          <td>${standings.response[0].league.standings[0][i].all.goals.for}</td>
          <td>${standings.response[0].league.standings[0][i].all.goals.against}</td>
          <td>${standings.response[0].league.standings[0][i].goalsDiff}</td>
          <td>${standings.response[0].league.standings[0][i].points}</td>
          <td>
            ${last5(standings.response[0].league.standings[0][i].form)[0]}
            ${last5(standings.response[0].league.standings[0][i].form)[1]}
            ${last5(standings.response[0].league.standings[0][i].form)[2]}
            ${last5(standings.response[0].league.standings[0][i].form)[3]}
            ${last5(standings.response[0].league.standings[0][i].form)[4]}
          </td>
        </tr>`
      }
      standingsData.innerHTML = standingsDataBody
      renderCoachAndVenue()
    }).catch(() => alert('Not yet available information'))
}

function renderTopScorers() {
  if (!!document.querySelector("#top-scorers-container")) {
    document.querySelector("#top-scorers-container").remove();
  }
  document
    .querySelector(".content")
    .appendChild(document.createElement("div"))
    .setAttribute("id", "top-scorers-container");
  
  //Verify there is no table prior appending it
  if (!!document.querySelector("#top-scorers")) {
    document.querySelector("#top-scorers").remove();
  }
  //Creation of the table headers
  document
    .querySelector("#top-scorers-container")
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
      <th>Top 5 Scorers</th>
      <th>Goals</th>
    </tr>`
    //Creation of the table body
    document
    .querySelector("#top-scorers").appendChild(document.createElement('tbody'))
    let leagueId = document.querySelector(
      "#league-champion h3:first-of-type"
    ).id; 
    let season = document.querySelector("select");
    let topScorersData =  document
    .querySelector("#top-scorers tbody")
    //Fetching to get the standings
    fetch(`https://v3.football.api-sports.io/players/topscorers?league=${leagueId}&season=${season.value}`, apiCongigObj)
      .then(resp => resp.json())
      .then(topScorers => {
        let topScorersDataBody = ""
        for (let i=0; i<5; i++) {
          topScorersDataBody += 
          `<tr>
            <td><img src = ${topScorers.response[i].statistics[0].team.logo}></td>
            <td>${topScorers.response[i].player.name}</td>
            <td>${topScorers.response[i].statistics[0].goals.total}</td>
          </tr>`
        }
        topScorersData.innerHTML = topScorersDataBody
      }).catch(() => alert('Not yet available information for top scorers'))
}

function renderCoachAndVenue() {
  document.querySelectorAll('#standings tbody tr')
  .forEach((team)=> {
    team.addEventListener('click', ()=> {
      //Remove country and team text requests if exist
      if (!!document.querySelector("#coach p")) {
        document.querySelector('#coach p').remove()
      }
      //Verify there is no images or names prior appending them
      if (!!document.querySelector('#coach img')) {
        document.querySelector("#coach img").remove();
      }
      //Prevent element to be event listened while fetching
      team.style.pointerEvents = 'none' 
      //Display loading spinner
      spinnerDisplayer('on','#coach')
      //Fetch coach
      fetch(`https://v3.football.api-sports.io/coachs?team=${team.children[2].id.split('-')[1]}`,apiCongigObj)
        .then(resp => resp.json())
        .then(coaches => {
          // document.querySelector('#coach').innerHTML = 
          // `<h2>Coach</h2>
          // <img src=${coaches.response[0].photo} class = "rounded-circle">
          // <h6>${coaches.response[0].name}</h6>`
          document.querySelector('#coach').appendChild(document.createElement('img')).setAttribute('src',`${coaches.response[0].photo}`)
          document.querySelector("#coach img").className = "rounded-circle"
          document.querySelector('#coach').appendChild(document.createElement('p')).textContent = `${coaches.response[0].name}`
          team.style.pointerEvents = 'auto' //Allows element to be event listened after fetiching
          //Don't display loading spinner
          spinnerDisplayer('off','#coach')
        })
      
      //Remove country and team text requests if exist
      if (!!document.querySelector("#venue p")) {
        document.querySelector('#venue p').remove()
      }
      //Verify there is no images or names prior appending them
      if (!!document.querySelector("#venue img")) {
        document.querySelector('#venue img').remove()
      }
      //Display loading spinner
      spinnerDisplayer('on','#venue')
       //Fetch team venue
      fetch(`https://v3.football.api-sports.io/teams?id=${team.children[2].id.split('-')[1]}`,apiCongigObj)
        .then(resp => resp.json())
        .then(teamInfo => {
          
          
          document.querySelector('#venue').appendChild(document.createElement('img')).setAttribute('src',`${teamInfo.response[0].venue.image}`)
          document.querySelector("#venue img").className = "rounded-circle"
          document.querySelector('#venue').appendChild(document.createElement('p')).textContent = `${teamInfo.response[0].venue.name}`
          team.style.pointerEvents = 'auto' //Allows element to be event listened after fetiching
          //Don't display loading spinner
          spinnerDisplayer('off','#venue')
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
function spinnerDisplayer(mode,parentSelector) {
  if (mode === 'on') {
    document.querySelector(`${parentSelector} .spinner-border`).style.display = 'block'
    document.querySelector(`${parentSelector} .spinner-border`).style.visibility = 'visible'
  } else if (mode === 'off') {
    document.querySelector(`${parentSelector} .spinner-border`).style.visibility = 'visible'
    document.querySelector(`${parentSelector} .spinner-border`).style.display = 'none'
  }
}