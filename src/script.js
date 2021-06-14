const countryTargets = [
  "Spain",
  "Germany",
  "Italy",
  "France",
  "England",
  "Portugal",
  "Belgium",
];
const apiCongigObj = {
  method: "GET",
  headers: {
    "x-rapidapi-host": "v3.football.api-sports.io",
    "x-rapidapi-key": "8bc0ad048d98ed6fa090704ed786ca23",
  },
};
//Render list of countries and their flags
fetch(`https://v3.football.api-sports.io/countries`, apiCongigObj)
  .then((response) => response.json())
  .then((country) => {
    country.response.forEach((country) => {
      for (let i = 0; i < countryTargets.length; i++) {
        if (countryTargets[i] === country.name) {
          document
            .getElementById("list-countries")
            .appendChild(document.createElement("li")).className = "country";
          document
            .getElementsByClassName("country")
            [document.getElementsByClassName("country").length - 1].appendChild(
              document.createElement("span")
            ).className = "country-flag";
          document
            .getElementsByClassName("country-flag")
            [
              document.getElementsByClassName("country-flag").length - 1
            ].appendChild(document.createElement("img"))
            .setAttribute("src", country.flag);
          document
            .getElementsByClassName("country")
            [document.getElementsByClassName("country").length - 1].appendChild(
              document.createElement("span")
            ).className = "country-name";
          document.getElementsByClassName("country-name")[
            document.getElementsByClassName("country-name").length - 1
          ].textContent = countryTargets[i];
        }
      }
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
          `https://v3.football.api-sports.io/leagues?country=${country.innerText}`,
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
            if (!!document.querySelectorAll(".content h3")[0]) {
              document.querySelectorAll(".content h3")[0].remove();
              document.querySelectorAll(".content img")[0].remove();
            }
            document
              .querySelector(".content")
              .appendChild(document.createElement("h3")).textContent =
              leagues.response[0].league.name;
            document
              .querySelector(".content h3:first-of-type")
              .setAttribute("id", leagues.response[0].league.id);
            document
              .querySelector(".content")
              .appendChild(document.createElement("img"))
              .setAttribute("src", leagues.response[0].league.logo);
            document
              .querySelector(".content")
              .appendChild(document.createElement("h3")).textContent =
              "1st Place";

            //Render the last champion team logo
            let leagueId = leagues.response[0].league.id;
            let season = document.querySelector("select");
            fetch(
              `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season.value}`,
              apiCongigObj
            )
              .then((resp) => resp.json())
              .then((standings) => {
                document
                  .querySelector(".content")
                  .appendChild(document.createElement("img"))
                  .setAttribute(
                    "src",
                    standings.response[0].league.standings[0][0].team.logo
                  );
                //Render Table & Standings last season
                renderStandingsTable();
              });
          });
      });
    }
    //Render champion team logo
    let season = document.querySelector("select");
    season.addEventListener("change", function () {
      if (!!document.querySelectorAll(".content img")[1]) {
        document.querySelectorAll(".content img")[1].remove();
      }
      let leagueId = document.querySelector(".content h3:first-of-type").id;
      fetch(
        `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season.value}`,
        apiCongigObj
      )
        .then((resp) => resp.json())
        .then((standings) => {
          document
            .querySelector(".content")
            .appendChild(document.createElement("img"))
            .setAttribute(
              "src",
              standings.response[0].league.standings[0][0].team.logo
            );

          //Render Table & Standings
          renderStandingsTable();
        });
    });
  });

function renderStandingsTable() {
  // let i=0
  // while (i>6) {
  //   document.querySelector('.content').children[i].remove()
  //   i--
  // }
  if (!!document.querySelector("#standings")) {
    document.querySelector("#standings").remove();
  }
  document
    .querySelector(".content")
    .appendChild(document.createElement("table"))
    .setAttribute("id", "standings");
  document
    .querySelector("#standings")
    .appendChild(document.createElement("thead")).className = "table-head";
  document
    .querySelector(".table-head")
    .appendChild(document.createElement("tr")).className = "headers";
  document
    .querySelector(".headers")
    .appendChild(document.createElement("th")).textContent = "Pos";
  document
    .querySelector(".headers")
    .appendChild(document.createElement("th")).textContent = "Team";
  document
    .querySelector(".headers")
    .appendChild(document.createElement("th")).textContent = "P";
  document
    .querySelector(".headers")
    .appendChild(document.createElement("th")).textContent = "W";
  document
    .querySelector(".headers")
    .appendChild(document.createElement("th")).textContent = "D";
  document
    .querySelector(".headers")
    .appendChild(document.createElement("th")).textContent = "L";
  document
    .querySelector(".headers")
    .appendChild(document.createElement("th")).textContent = "GF";
  document
    .querySelector(".headers")
    .appendChild(document.createElement("th")).textContent = "GA";
  document
    .querySelector(".headers")
    .appendChild(document.createElement("th")).textContent = "+/-";
  document
    .querySelector(".headers")
    .appendChild(document.createElement("th")).textContent = "PTS";
}
