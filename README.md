-Kort abstract
Jeg har lavet et script som kan login på Lectio og scrape kalenderen for nogle sat uger for sig selv og output det til en ’ics’ fil i JavaScript ved hjælp af puppeteer og ical. Det er lavet, da jeg har store problemer med Lectios mangel på integration for google- og Apple kalender og jeg derfor skal tjekke to kalendere for at finde ud af om jeg har fri eller andre planer på et givent tidspunkt.
Funktionsbeskrivelse
det er et program med minimal interaktion altså kun nogle ting man skal indtaste inden man starter (skole Id, brugernavn, adgangskode, Antal Uger,) og nogle outputs i form af ’ics’ filer. Det kører det bare hvert 10. minut og scraper ens skema over og over.

-Pseudokode
// Funktion til at skrabe skemaet
Funktion scrapeSchedule(skole, brugernavn, adgangskode, og antal uger)
  Start ny browser-session med Puppeteer
  Åbn en ny fane

  Prøv
    Gå til login-siden for Lectio
    Udfyld brugernavn og adgangskode og log ind

    Bestem den aktuelle uge
    For hver uge i den ønskede periode
      Bestem det aktuelle år

      Gå til skemasiden for den aktuelle uge
      Find alle skemabrik-containerne på siden
      For hver skemabrik-container
        Find alle links inde i containeren
        For hvert link
          Hent tooltip-data fra linket
          Hvis tooltip-data findes
            Hvis begivenheden er ikke aflyst
              Udtræk dato, starttid, sluttid, titel, yderligere info og beskrivelse fra tooltip-data
              Opret start- og sluttidspunkter som JavaScript Date-objekter
              Tilføj begivenheden til listen af begivenheder

      Opret en kalender med begivenhederne
      Konverter kalenderen til en streng i iCalendar-format
      Hvis der er begivenheder
        Gem ICS-filen
        Udskriv iConsole: "ICS-fil gemt"

      Gå videre til næste uge

  Til sidst
    Luk browseren

// Funktion til at køre skrabningen
Funktion runScrape()
  Sæt skole, brugernavn, adgangskode, og antal uger
  Kald scrapeSchedule med de angivne parametre

// Kør den indledende skrabning ved opstart
Kald runScrape

// Planlæg skrabningen til at køre hver 10. minut
Hver 10. minut: Kald runScrape

 
-Test af programmet
Jeg har kørt nogle forskellige test af forskellige versioner af programmet og har fundet at efter en masse debugging fungere det nogle lunde som det skal. Det kunne dog være rart at hvert lektionens titel var mere præcis hvilket nok havde krævet en anden metode at filtrere og udtrække informationen. 

-Konklusion
Programmet kræver minimal interaktion, idet man kun skal indtaste nogle oplysninger (skole-ID, brugernavn, adgangskode, antal uger). Herefter kører det automatisk hvert 10. minut, skraber og gemmer skemaet i form af 'ics'-filer. En forbedring kunne være at gøre lektionstitlerne mere præcise, hvilket kræver en anden metode til filtrering og udtrækning af informationen, som jeg ikke har haft tid til at lave.
Samlet set har projektet løst mit problem med Lectios kalenderintegration og virker som en automatiseret løsning til at samle skemadata i en kalenderfil jeg kan importere til min kalender.
