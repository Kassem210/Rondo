// Raw records, one per line.
//   clubs:   Name|alias,alias
//   players: Name|alias,alias|Club; Club; Club   (senior clubs, loans included)
const RAW_RECORDS = {
clubs: `
Arsenal|gunners
Aston Villa|villa
Bournemouth
Brentford
Brighton|brighton and hove albion,brighton hove albion
Burnley
Chelsea
Crystal Palace|palace
Everton
Fulham
Leeds United|leeds
Leicester City|leicester
Liverpool|lfc
Manchester City|man city,city,mcfc
Manchester United|man united,man utd,united,man u,manu,mufc
Newcastle United|newcastle,nufc
Nottingham Forest|forest,nottm forest
Southampton|saints
Tottenham|spurs,tottenham hotspur
West Ham|west ham united
Wolves|wolverhampton,wolverhampton wanderers
Blackburn Rovers|blackburn
Bolton|bolton wanderers
Sunderland
Middlesbrough|boro
Portsmouth|pompey
Stoke City|stoke
Swansea City|swansea
West Brom|west bromwich albion,wba
Watford
Derby County|derby
QPR|queens park rangers
Charlton|charlton athletic
Wigan|wigan athletic
Birmingham City|birmingham
Sheffield United|sheffield utd
Hull City|hull
Norwich City|norwich
Reading
Coventry City|coventry
Ipswich Town|ipswich
MK Dons
Preston|preston north end
Barnsley
Fleetwood Town|fleetwood
Stocksbridge Park Steels|stocksbridge
Halifax Town|halifax
Real Madrid|madrid,real
Barcelona|barca,fcb
Atlético Madrid|atletico,atleti,atletico de madrid
Sevilla
Valencia
Villarreal
Real Sociedad|sociedad,la real
Athletic Bilbao|athletic club,athletic,bilbao
Real Betis|betis
Deportivo La Coruña|deportivo,depor,deportivo de la coruna
Málaga
Espanyol
Celta Vigo|celta,celta de vigo
Getafe
Mallorca|real mallorca
Real Zaragoza|zaragoza
Levante
Girona
Osasuna
Rayo Vallecano|rayo
Las Palmas
Sporting Gijón|sporting de gijon,gijon
Almería
Granada
Eibar
Juventus|juve
AC Milan|milan
Inter Milan|inter,internazionale
Roma|as roma
Napoli
Lazio
Fiorentina
Atalanta
Parma
Sampdoria
Genoa
Torino
Udinese
Bologna
Palermo
Cagliari
Brescia
Sassuolo
Empoli
Como
Monza
Lecce
Pescara
Verona|hellas verona
Cremonese
Bayern Munich|bayern,bayern munchen,fc bayern
Borussia Dortmund|dortmund,bvb
Bayer Leverkusen|leverkusen
RB Leipzig|leipzig
Schalke 04|schalke
Werder Bremen|bremen,werder
Hamburg|hsv,hamburger sv
Wolfsburg
Eintracht Frankfurt|frankfurt,eintracht
Stuttgart|vfb stuttgart
Borussia Mönchengladbach|gladbach,monchengladbach
Hoffenheim
Mainz|mainz 05
Kaiserslautern
Köln|cologne,koln
Hertha Berlin|hertha,hertha bsc
Freiburg
Hannover 96|hannover
Nürnberg|nurnberg,nuremberg
St. Pauli|st pauli
PSG|paris saint germain,paris sg,paris,paris st germain
Marseille|om,olympique de marseille
Lyon|ol,olympique lyonnais
Monaco|as monaco
Lille|losc
Bordeaux
Nice|ogc nice
Rennes|stade rennais
Saint-Étienne|st etienne,asse
Nantes
Lens|rc lens
Toulouse
Montpellier
Metz
Auxerre
Le Havre
Cannes
Guingamp
Lorient
Caen
Sochaux
Reims|stade de reims
Ajax
PSV|psv eindhoven
Feyenoord
AZ Alkmaar|az
Groningen
Heerenveen
Twente
Vitesse
Utrecht
Willem II
Sparta Rotterdam
Benfica
Porto|fc porto
Sporting CP|sporting,sporting lisbon
Braga
Celtic
Rangers
Galatasaray|gala
Fenerbahçe|fener
Beşiktaş
Trabzonspor
Anderlecht
Club Brugge|brugge
Genk
Gent
Basel
Red Bull Salzburg|salzburg,rb salzburg
Shakhtar Donetsk|shakhtar
Dynamo Kyiv|dynamo kiev,dinamo kiev
Zenit|zenit st petersburg
CSKA Moscow|cska
Anzhi|anzhi makhachkala
Olympiacos
Dinamo Zagreb
Red Star Belgrade|red star,crvena zvezda
Partizan
Copenhagen|fc copenhagen
Molde
Malmö|malmo ff
Santos
Flamengo
São Paulo
Corinthians
Palmeiras
Grêmio
Internacional
Cruzeiro
Atlético Mineiro
Fluminense
Vasco da Gama|vasco
Botafogo
Boca Juniors|boca
River Plate|river
Independiente
Racing Club|racing
Newell's Old Boys|newells
Estudiantes
Vélez Sarsfield|velez
Rosario Central
Argentinos Juniors|argentinos
Lanús
Peñarol
Nacional
Danubio
Liverpool Montevideo
Inter Miami|miami
LA Galaxy|galaxy,los angeles galaxy
LAFC|los angeles fc
New York Red Bulls|red bulls,ny red bulls
New York City FC|nycfc,new york city
New York Cosmos|cosmos
Orlando City|orlando
Chicago Fire
DC United
Toronto FC|toronto
Montreal|cf montreal,montreal impact
Vancouver Whitecaps|vancouver,whitecaps
Club América|america
Al Nassr|nassr,al nasr
Al Hilal|hilal
Al Ittihad|ittihad
Al Ahli|al ahli jeddah
Al Ettifaq|ettifaq
Al Qadsiah|qadsiah
Al Shabab
Al Sadd|sadd
Al Duhail|duhail
Al Gharafa|gharafa
Al Jazira|jazira
Al Ahly|ahly
Zamalek
Al Mokawloon|arab contractors,el mokawloon,mokawloon
Wadi Degla|degla
Tersana
Baniyas
Vissel Kobe|kobe
Shanghai SIPG|shanghai port
Shanghai Shenhua|shenhua
Guangzhou Evergrande|guangzhou
Hebei China Fortune|hebei
Dalian Yifang|dalian
Sydney FC|sydney
CSKA Sofia
Cardiff City|cardiff
Mumbai City
`,
players: `
Lionel Messi|leo messi|Barcelona; PSG; Inter Miami
Cristiano Ronaldo|cr7,cristiano|Sporting CP; Manchester United; Real Madrid; Juventus; Al Nassr
Neymar|neymar jr|Santos; Barcelona; PSG; Al Hilal
Kylian Mbappé||Monaco; PSG; Real Madrid
Erling Haaland||Molde; Red Bull Salzburg; Borussia Dortmund; Manchester City
Mohamed Salah|mo salah|Al Mokawloon; Basel; Chelsea; Fiorentina; Roma; Liverpool
Kevin De Bruyne|kdb|Genk; Chelsea; Werder Bremen; Wolfsburg; Manchester City; Napoli
Luka Modrić||Dinamo Zagreb; Tottenham; Real Madrid; AC Milan
Robert Lewandowski|lewy|Borussia Dortmund; Bayern Munich; Barcelona
Karim Benzema||Lyon; Real Madrid; Al Ittihad
Harry Kane||Tottenham; Leicester City; Norwich City; Bayern Munich
Vinícius Júnior|vinicius jr,vini jr,vini,vinicius|Flamengo; Real Madrid
Jude Bellingham||Birmingham City; Borussia Dortmund; Real Madrid
Lamine Yamal|yamal|Barcelona
Pedri||Las Palmas; Barcelona
Gavi||Barcelona
Rodri||Villarreal; Atlético Madrid; Manchester City
Bukayo Saka||Arsenal
Phil Foden||Manchester City
Cole Palmer||Manchester City; Chelsea
Declan Rice||West Ham; Arsenal
Martin Ødegaard|odegaard|Real Madrid; Heerenveen; Vitesse; Real Sociedad; Arsenal
Bruno Fernandes||Udinese; Sampdoria; Sporting CP; Manchester United
Marcus Rashford||Manchester United; Aston Villa; Barcelona
Jack Grealish||Aston Villa; Manchester City; Everton
Raheem Sterling||Liverpool; Manchester City; Chelsea; Arsenal
Jadon Sancho||Borussia Dortmund; Manchester United; Chelsea; Aston Villa
Mason Mount||Vitesse; Derby County; Chelsea; Manchester United
Trent Alexander-Arnold|trent,taa|Liverpool; Real Madrid
Virgil van Dijk|vvd|Groningen; Celtic; Southampton; Liverpool
Alisson|alisson becker|Internacional; Roma; Liverpool
Sadio Mané||Metz; Red Bull Salzburg; Southampton; Liverpool; Bayern Munich; Al Nassr
Roberto Firmino|bobby firmino|Hoffenheim; Liverpool; Al Ahli; Al Sadd
Luis Díaz|lucho diaz|Porto; Liverpool; Bayern Munich
Darwin Núñez||Almería; Benfica; Liverpool; Al Hilal
Diogo Jota||Porto; Wolves; Liverpool
Andrew Robertson|andy robertson|Hull City; Liverpool
Jordan Henderson||Sunderland; Coventry City; Liverpool; Al Ettifaq; Ajax; Brentford
Fabinho||Real Madrid; Monaco; Liverpool; Al Ittihad
Thiago Alcântara|thiago|Barcelona; Bayern Munich; Liverpool
Dominik Szoboszlai||Red Bull Salzburg; RB Leipzig; Liverpool
Alexis Mac Allister||Argentinos Juniors; Boca Juniors; Brighton; Liverpool
Cody Gakpo||PSV; Liverpool
Florian Wirtz||Bayer Leverkusen; Liverpool
Alexander Isak||Borussia Dortmund; Willem II; Real Sociedad; Newcastle United; Liverpool
Hugo Ekitike||Reims; PSG; Eintracht Frankfurt; Liverpool
Steven Gerrard|stevie g|Liverpool; LA Galaxy
Fernando Torres|el nino|Atlético Madrid; Liverpool; Chelsea; AC Milan
Xabi Alonso||Real Sociedad; Eibar; Liverpool; Real Madrid; Bayern Munich
Luis Suárez||Nacional; Groningen; Ajax; Liverpool; Barcelona; Atlético Madrid; Grêmio; Inter Miami
Philippe Coutinho||Vasco da Gama; Inter Milan; Espanyol; Liverpool; Barcelona; Bayern Munich; Aston Villa; Al Duhail
Michael Owen||Liverpool; Real Madrid; Newcastle United; Manchester United; Stoke City
Robbie Fowler||Liverpool; Leeds United; Manchester City; Cardiff City; Blackburn Rovers
Jamie Carragher||Liverpool
Javier Mascherano||River Plate; Corinthians; West Ham; Liverpool; Barcelona; Hebei China Fortune; Estudiantes
Pepe Reina||Barcelona; Villarreal; Liverpool; Napoli; Bayern Munich; AC Milan; Aston Villa; Lazio; Como
Wayne Rooney|wazza|Everton; Manchester United; DC United; Derby County
Ryan Giggs||Manchester United
Paul Scholes||Manchester United
David Beckham|becks|Manchester United; Preston; Real Madrid; LA Galaxy; AC Milan; PSG
Roy Keane||Nottingham Forest; Manchester United; Celtic
Eric Cantona||Auxerre; Marseille; Bordeaux; Montpellier; Leeds United; Manchester United
Rio Ferdinand||West Ham; Bournemouth; Leeds United; Manchester United; QPR
Nemanja Vidić||Red Star Belgrade; Manchester United; Inter Milan
Patrice Evra||Monaco; Nice; Manchester United; Juventus; Marseille; West Ham
Gary Neville||Manchester United
Edwin van der Sar||Ajax; Juventus; Fulham; Manchester United
Peter Schmeichel||Manchester United; Sporting CP; Aston Villa; Manchester City
David de Gea||Atlético Madrid; Manchester United; Fiorentina
Ruud van Nistelrooy||Heerenveen; PSV; Manchester United; Real Madrid; Hamburg; Málaga
Carlos Tevez||Boca Juniors; Corinthians; West Ham; Manchester United; Manchester City; Juventus; Shanghai Shenhua
Dimitar Berbatov||CSKA Sofia; Bayer Leverkusen; Tottenham; Manchester United; Fulham; Monaco
Michael Carrick||West Ham; Tottenham; Manchester United
Nani||Sporting CP; Manchester United; Fenerbahçe; Valencia; Lazio; Orlando City
Robin van Persie|rvp|Feyenoord; Arsenal; Manchester United; Fenerbahçe
Juan Mata||Valencia; Chelsea; Manchester United; Galatasaray; Vissel Kobe
Paul Pogba||Manchester United; Juventus; Monaco
Zlatan Ibrahimović|ibra,zlatan|Malmö; Ajax; Juventus; Inter Milan; Barcelona; AC Milan; PSG; Manchester United; LA Galaxy
Romelu Lukaku||Anderlecht; Chelsea; West Brom; Everton; Manchester United; Inter Milan; Roma; Napoli
Anthony Martial||Lyon; Monaco; Manchester United; Sevilla
Casemiro||São Paulo; Porto; Real Madrid; Manchester United
Raphaël Varane||Lens; Real Madrid; Manchester United; Como
Harry Maguire||Sheffield United; Hull City; Wigan; Leicester City; Manchester United
Luke Shaw||Southampton; Manchester United
Edinson Cavani||Danubio; Palermo; Napoli; PSG; Manchester United; Valencia; Boca Juniors
Ángel Di María||Rosario Central; Benfica; Real Madrid; Manchester United; PSG; Juventus
Alejandro Garnacho||Manchester United; Chelsea
Rasmus Højlund|hojlund|Copenhagen; Atalanta; Manchester United; Napoli
Antony||São Paulo; Ajax; Manchester United; Real Betis
Lisandro Martínez||Newell's Old Boys; Ajax; Manchester United
Christian Eriksen||Ajax; Tottenham; Inter Milan; Brentford; Manchester United; Wolfsburg
Matheus Cunha||RB Leipzig; Hertha Berlin; Atlético Madrid; Wolves; Manchester United
Bryan Mbeumo||Brentford; Manchester United
Benjamin Šeško|sesko|Red Bull Salzburg; RB Leipzig; Manchester United
Thierry Henry|titi|Monaco; Juventus; Arsenal; Barcelona; New York Red Bulls
Dennis Bergkamp||Ajax; Inter Milan; Arsenal
Patrick Vieira||Cannes; AC Milan; Arsenal; Juventus; Inter Milan; Manchester City
Robert Pirès|pires|Metz; Marseille; Arsenal; Villarreal; Aston Villa
Cesc Fàbregas||Arsenal; Barcelona; Chelsea; Monaco; Como
Tony Adams||Arsenal
Sol Campbell||Tottenham; Arsenal; Portsmouth; Newcastle United
Ashley Cole||Arsenal; Crystal Palace; Chelsea; Roma; LA Galaxy; Derby County
Freddie Ljungberg||Arsenal; West Ham; Celtic
Ian Wright||Crystal Palace; Arsenal; West Ham; Celtic; Burnley
Mesut Özil||Schalke 04; Werder Bremen; Real Madrid; Arsenal; Fenerbahçe
Alexis Sánchez||Udinese; River Plate; Barcelona; Arsenal; Manchester United; Inter Milan; Marseille
Pierre-Emerick Aubameyang|auba|AC Milan; Lille; Monaco; Saint-Étienne; Borussia Dortmund; Arsenal; Barcelona; Chelsea; Marseille; Al Qadsiah
Alexandre Lacazette||Lyon; Arsenal
Olivier Giroud||Montpellier; Arsenal; Chelsea; AC Milan; LAFC; Lille
Santi Cazorla||Villarreal; Málaga; Arsenal; Al Sadd
Aaron Ramsey||Arsenal; Nottingham Forest; Juventus; Rangers; Nice
Jack Wilshere||Arsenal; Bolton; Bournemouth; West Ham
Theo Walcott||Southampton; Arsenal; Everton
Samir Nasri||Marseille; Arsenal; Manchester City; Sevilla; West Ham; Anderlecht
Gabriel Jesus||Palmeiras; Manchester City; Arsenal
Gabriel Martinelli||Arsenal
William Saliba||Saint-Étienne; Arsenal; Nice; Marseille
Kai Havertz||Bayer Leverkusen; Chelsea; Arsenal
Granit Xhaka||Basel; Borussia Mönchengladbach; Arsenal; Bayer Leverkusen; Sunderland
Viktor Gyökeres|gyokeres|Brighton; St. Pauli; Swansea City; Coventry City; Sporting CP; Arsenal
Eberechi Eze||QPR; Crystal Palace; Arsenal
Frank Lampard|lamps|West Ham; Swansea City; Chelsea; Manchester City; New York City FC
John Terry||Chelsea; Nottingham Forest; Aston Villa
Didier Drogba||Guingamp; Marseille; Chelsea; Shanghai Shenhua; Galatasaray; Montreal
Eden Hazard||Lille; Chelsea; Real Madrid
Petr Čech|cech|Rennes; Chelsea; Arsenal
Michael Essien||Lyon; Chelsea; Real Madrid; AC Milan
Claude Makélélé||Nantes; Marseille; Celta Vigo; Real Madrid; Chelsea; PSG
Michael Ballack||Kaiserslautern; Bayer Leverkusen; Bayern Munich; Chelsea
Arjen Robben||Groningen; PSV; Chelsea; Real Madrid; Bayern Munich
Joe Cole||West Ham; Chelsea; Liverpool; Lille; Aston Villa
Gianfranco Zola||Napoli; Parma; Chelsea; Cagliari
Diego Costa||Braga; Atlético Madrid; Chelsea; Atlético Mineiro; Wolves; Botafogo
N'Golo Kanté|kante|Caen; Leicester City; Chelsea; Al Ittihad
Thibaut Courtois||Genk; Chelsea; Atlético Madrid; Real Madrid
César Azpilicueta|azpi,dave|Osasuna; Marseille; Chelsea; Atlético Madrid; Sevilla
David Luiz||Benfica; Chelsea; PSG; Arsenal; Flamengo
Willian||Corinthians; Shakhtar Donetsk; Anzhi; Chelsea; Arsenal; Fulham; Olympiacos
Oscar||São Paulo; Internacional; Chelsea; Shanghai SIPG
Thiago Silva||Fluminense; AC Milan; PSG; Chelsea
Jorginho||Verona; Napoli; Chelsea; Arsenal; Flamengo
Mateo Kovačić||Dinamo Zagreb; Inter Milan; Real Madrid; Chelsea; Manchester City
Christian Pulisic||Borussia Dortmund; Chelsea; AC Milan
Enzo Fernández||River Plate; Benfica; Chelsea
Moisés Caicedo||Brighton; Chelsea
Reece James||Wigan; Chelsea
Nicolas Jackson||Villarreal; Chelsea; Bayern Munich
João Pedro||Fluminense; Watford; Brighton; Chelsea
Sergio Agüero|kun aguero,kun|Independiente; Atlético Madrid; Manchester City; Barcelona
David Silva||Valencia; Eibar; Celta Vigo; Manchester City; Real Sociedad
Yaya Touré||Monaco; Olympiacos; Barcelona; Manchester City
Vincent Kompany||Anderlecht; Hamburg; Manchester City
Bernardo Silva||Benfica; Monaco; Manchester City
Riyad Mahrez||Le Havre; Leicester City; Manchester City; Al Ahli
İlkay Gündoğan||Nürnberg; Borussia Dortmund; Manchester City; Barcelona; Galatasaray
Ederson||Benfica; Manchester City; Fenerbahçe
Kyle Walker||Sheffield United; Tottenham; Aston Villa; Manchester City; AC Milan; Burnley
John Stones||Barnsley; Everton; Manchester City
Rúben Dias||Benfica; Manchester City
Leroy Sané||Schalke 04; Manchester City; Bayern Munich; Galatasaray
Julián Álvarez||River Plate; Manchester City; Atlético Madrid
Joško Gvardiol||Dinamo Zagreb; RB Leipzig; Manchester City
Omar Marmoush||Wadi Degla; Wolfsburg; St. Pauli; Stuttgart; Eintracht Frankfurt; Manchester City
Tijjani Reijnders||AZ Alkmaar; AC Milan; Manchester City
Rayan Cherki||Lyon; Manchester City
Gianluigi Donnarumma|gigio|AC Milan; PSG; Manchester City
Joe Hart||Manchester City; Birmingham City; Torino; West Ham; Burnley; Tottenham; Celtic
Mario Balotelli||Inter Milan; Manchester City; AC Milan; Liverpool; Nice; Marseille; Brescia; Monza; Genoa
Robinho||Santos; Real Madrid; Manchester City; AC Milan; Guangzhou Evergrande; Atlético Mineiro
Edin Džeko||Wolfsburg; Manchester City; Roma; Inter Milan; Fenerbahçe; Fiorentina
Son Heung-min|sonny,son|Hamburg; Bayer Leverkusen; Tottenham; LAFC
Gareth Bale||Southampton; Tottenham; Real Madrid; LAFC
Dele Alli|dele|MK Dons; Tottenham; Everton; Beşiktaş; Como
Hugo Lloris||Nice; Lyon; Tottenham; LAFC
Jan Vertonghen||Ajax; Tottenham; Benfica; Anderlecht
Mousa Dembélé||AZ Alkmaar; Fulham; Tottenham
Ledley King||Tottenham
Robbie Keane||Wolves; Coventry City; Inter Milan; Leeds United; Tottenham; Liverpool; Celtic; West Ham; LA Galaxy; Aston Villa
Jermain Defoe||West Ham; Bournemouth; Tottenham; Portsmouth; Toronto FC; Sunderland; Rangers
Richarlison||Fluminense; Watford; Everton; Tottenham
James Maddison||Coventry City; Norwich City; Leicester City; Tottenham
Dejan Kulusevski||Atalanta; Parma; Juventus; Tottenham
Mohammed Kudus||Ajax; West Ham; Tottenham
Xavi Simons||PSV; PSG; RB Leipzig; Tottenham
Alan Shearer||Southampton; Blackburn Rovers; Newcastle United
Jamie Vardy||Stocksbridge Park Steels; Halifax Town; Fleetwood Town; Leicester City; Cremonese
Wilfried Zaha||Crystal Palace; Manchester United; Galatasaray; Lyon
Tim Cahill||Everton; New York Red Bulls; Shanghai Shenhua
Leighton Baines||Wigan; Everton
Paul Gascoigne|gazza|Newcastle United; Tottenham; Lazio; Rangers; Middlesbrough; Everton
Gary Lineker||Leicester City; Everton; Barcelona; Tottenham
Matt Le Tissier||Southampton
Paolo Di Canio||Lazio; Juventus; Napoli; AC Milan; Celtic; West Ham; Charlton
Dimitri Payet||Nantes; Saint-Étienne; Lille; Marseille; West Ham; Vasco da Gama
Jay-Jay Okocha|okocha|Eintracht Frankfurt; Fenerbahçe; PSG; Bolton; Hull City
Bruno Guimarães||Lyon; Newcastle United
Ollie Watkins||Brentford; Aston Villa
Emiliano Martínez|dibu martinez,emi martinez,dibu|Arsenal; Aston Villa
Jarrod Bowen||Hull City; West Ham
Ivan Toney||Newcastle United; Brentford; Al Ahli
Xavi|xavi hernandez|Barcelona; Al Sadd
Andrés Iniesta||Barcelona; Vissel Kobe
Sergio Busquets|busi|Barcelona; Inter Miami
Carles Puyol||Barcelona
Gerard Piqué||Manchester United; Real Zaragoza; Barcelona
Dani Alves||Sevilla; Barcelona; Juventus; PSG; São Paulo
Jordi Alba||Valencia; Barcelona; Inter Miami
Ronaldinho|dinho,ronaldinho gaucho|Grêmio; PSG; Barcelona; AC Milan; Flamengo; Atlético Mineiro
Samuel Eto'o||Real Madrid; Mallorca; Barcelona; Inter Milan; Anzhi; Chelsea; Everton; Sampdoria
Rivaldo||Palmeiras; Deportivo La Coruña; Barcelona; AC Milan; Olympiacos
Ronaldo Nazário|r9,ronaldo,el fenomeno|Cruzeiro; PSV; Barcelona; Inter Milan; Real Madrid; AC Milan; Corinthians
Romário||Vasco da Gama; PSV; Barcelona; Flamengo; Valencia; Fluminense
Pep Guardiola||Barcelona; Brescia; Roma; Al Ahli
Johan Cruyff|cruijff|Ajax; Barcelona; Feyenoord; Levante
Diego Maradona|el diego|Argentinos Juniors; Boca Juniors; Barcelona; Napoli; Sevilla; Newell's Old Boys
Hristo Stoichkov||CSKA Sofia; Barcelona; Parma
Ronald Koeman||Groningen; Ajax; PSV; Barcelona; Feyenoord
Patrick Kluivert||Ajax; AC Milan; Barcelona; Newcastle United; Valencia; PSV; Lille
Deco||Porto; Barcelona; Chelsea; Fluminense
Víctor Valdés||Barcelona; Manchester United; Middlesbrough
Pedro|pedro rodriguez|Barcelona; Chelsea; Roma; Lazio
David Villa|el guaje|Sporting Gijón; Real Zaragoza; Valencia; Barcelona; Atlético Madrid; New York City FC; Vissel Kobe
Ivan Rakitić||Basel; Schalke 04; Sevilla; Barcelona
Marc-André ter Stegen||Borussia Mönchengladbach; Barcelona
Antoine Griezmann|grizi|Real Sociedad; Atlético Madrid; Barcelona
Ousmane Dembélé||Rennes; Borussia Dortmund; Barcelona; PSG
Frenkie de Jong||Willem II; Ajax; Barcelona
Ansu Fati||Barcelona; Brighton; Monaco
Raphinha||Sporting CP; Rennes; Leeds United; Barcelona
Ronald Araújo||Barcelona
Jules Koundé||Bordeaux; Sevilla; Barcelona
Dani Olmo||Dinamo Zagreb; RB Leipzig; Barcelona
Ferran Torres||Valencia; Manchester City; Barcelona
Memphis Depay||PSV; Manchester United; Lyon; Barcelona; Atlético Madrid; Corinthians
Arturo Vidal||Bayer Leverkusen; Juventus; Bayern Munich; Barcelona; Inter Milan; Flamengo
Zinedine Zidane|zizou|Cannes; Bordeaux; Juventus; Real Madrid
Raúl|raul gonzalez|Real Madrid; Schalke 04; Al Sadd; New York Cosmos
Iker Casillas||Real Madrid; Porto
Sergio Ramos||Sevilla; Real Madrid; PSG
Roberto Carlos||Palmeiras; Inter Milan; Real Madrid; Fenerbahçe; Corinthians; Anzhi
Luís Figo||Sporting CP; Barcelona; Real Madrid; Inter Milan
Marcelo||Fluminense; Real Madrid; Olympiacos
Toni Kroos||Bayern Munich; Bayer Leverkusen; Real Madrid
Pepe||Porto; Real Madrid; Beşiktaş
Kaká|kaka|São Paulo; AC Milan; Real Madrid; Orlando City
Isco||Valencia; Málaga; Real Madrid; Sevilla; Real Betis
James Rodríguez||Porto; Monaco; Real Madrid; Bayern Munich; Everton; Olympiacos; São Paulo; Rayo Vallecano
Gonzalo Higuaín|pipita|River Plate; Real Madrid; Napoli; Juventus; AC Milan; Chelsea; Inter Miami
Fernando Hierro||Real Madrid; Bolton
Guti||Real Madrid; Beşiktaş
Fernando Morientes||Real Zaragoza; Real Madrid; Monaco; Liverpool; Valencia; Marseille
Dani Carvajal||Bayer Leverkusen; Real Madrid
Marco Asensio||Mallorca; Espanyol; Real Madrid; PSG; Aston Villa; Fenerbahçe
Federico Valverde|fede valverde|Peñarol; Deportivo La Coruña; Real Madrid
Rodrygo||Santos; Real Madrid
Eduardo Camavinga||Rennes; Real Madrid
Aurélien Tchouaméni||Bordeaux; Monaco; Real Madrid
Antonio Rüdiger||Stuttgart; Roma; Chelsea; Real Madrid
David Alaba||Bayern Munich; Hoffenheim; Real Madrid
Éder Militão||São Paulo; Porto; Real Madrid
Arda Güler||Fenerbahçe; Real Madrid
Dean Huijsen||Juventus; Roma; Bournemouth; Real Madrid
Álvaro Morata||Real Madrid; Juventus; Chelsea; Atlético Madrid; AC Milan; Galatasaray; Como
Keylor Navas||Levante; Real Madrid; PSG; Nottingham Forest
Achraf Hakimi||Real Madrid; Borussia Dortmund; Inter Milan; PSG
Diego Forlán||Independiente; Manchester United; Villarreal; Atlético Madrid; Inter Milan; Internacional; Peñarol
Radamel Falcao|el tigre|River Plate; Porto; Atlético Madrid; Monaco; Manchester United; Chelsea; Galatasaray; Rayo Vallecano
Diego Godín||Villarreal; Atlético Madrid; Inter Milan; Cagliari
Koke||Atlético Madrid
Jan Oblak||Benfica; Atlético Madrid
João Félix||Benfica; Atlético Madrid; Chelsea; Barcelona; AC Milan; Al Nassr
Diego Simeone|cholo|Vélez Sarsfield; Sevilla; Atlético Madrid; Inter Milan; Lazio; Racing Club
Rodrigo De Paul||Racing Club; Valencia; Udinese; Atlético Madrid; Inter Miami
Juan Román Riquelme||Boca Juniors; Barcelona; Villarreal; Argentinos Juniors
Nico Williams||Athletic Bilbao
Mikel Oyarzabal||Real Sociedad
Martín Zubimendi||Real Sociedad; Arsenal
Iago Aspas||Celta Vigo; Liverpool; Sevilla
Joaquín||Real Betis; Valencia; Málaga; Fiorentina
Paolo Maldini||AC Milan
Franco Baresi||AC Milan
Andrea Pirlo||Brescia; Inter Milan; AC Milan; Juventus; New York City FC
Gennaro Gattuso|rino gattuso|Rangers; AC Milan
Clarence Seedorf||Ajax; Sampdoria; Real Madrid; Inter Milan; AC Milan; Botafogo
Andriy Shevchenko|sheva|Dynamo Kyiv; AC Milan; Chelsea
Filippo Inzaghi|pippo inzaghi|Parma; Atalanta; Juventus; AC Milan
Alessandro Nesta||Lazio; AC Milan; Montreal
Marco van Basten||Ajax; AC Milan
Ruud Gullit||Feyenoord; PSV; AC Milan; Sampdoria; Chelsea
Frank Rijkaard||Ajax; Sporting CP; Real Zaragoza; AC Milan
George Weah||Monaco; PSG; AC Milan; Chelsea; Manchester City; Marseille
Cafu||São Paulo; Real Zaragoza; Palmeiras; Roma; AC Milan
Rafael Leão||Sporting CP; Lille; AC Milan
Theo Hernández||Atlético Madrid; Real Madrid; Real Sociedad; AC Milan; Al Hilal
Alessandro Del Piero|pinturicchio|Juventus; Sydney FC
Gianluigi Buffon|gigi buffon|Parma; Juventus; PSG
Giorgio Chiellini||Fiorentina; Juventus; LAFC
Leonardo Bonucci||Inter Milan; Juventus; AC Milan; Fenerbahçe
Pavel Nedvěd||Lazio; Juventus
David Trezeguet||Monaco; Juventus; River Plate; Newell's Old Boys
Michel Platini||Saint-Étienne; Juventus
Roberto Baggio|il divin codino|Fiorentina; Juventus; AC Milan; Bologna; Inter Milan; Brescia
Paulo Dybala|la joya|Palermo; Juventus; Roma
Claudio Marchisio||Juventus; Empoli; Zenit
Fabio Cannavaro||Napoli; Parma; Inter Milan; Juventus; Real Madrid
Lilian Thuram||Monaco; Parma; Juventus; Barcelona
Edgar Davids||Ajax; AC Milan; Juventus; Barcelona; Inter Milan; Tottenham; Crystal Palace
Federico Chiesa||Fiorentina; Juventus; Liverpool
Dušan Vlahović||Partizan; Fiorentina; Juventus
Miralem Pjanić||Metz; Lyon; Roma; Juventus; Barcelona; Beşiktaş
Matthijs de Ligt||Ajax; Juventus; Bayern Munich; Manchester United
Javier Zanetti|pupi|Inter Milan
Wesley Sneijder||Ajax; Real Madrid; Inter Milan; Galatasaray; Nice; Al Gharafa
Diego Milito||Racing Club; Genoa; Real Zaragoza; Inter Milan
Esteban Cambiasso||Independiente; River Plate; Real Madrid; Inter Milan; Leicester City; Olympiacos
Júlio César||Flamengo; Inter Milan; QPR; Toronto FC; Benfica
Maicon||Cruzeiro; Monaco; Inter Milan; Manchester City; Roma
Adriano|adriano imperador|Flamengo; Inter Milan; Fiorentina; Parma; São Paulo; Roma; Corinthians
Christian Vieri|bobo vieri|Torino; Atalanta; Juventus; Atlético Madrid; Lazio; Inter Milan; AC Milan; Monaco; Fiorentina
Lautaro Martínez||Racing Club; Inter Milan
Nicolò Barella||Cagliari; Como; Inter Milan
Marcus Thuram||Sochaux; Guingamp; Borussia Mönchengladbach; Inter Milan
Hakan Çalhanoğlu||Hamburg; Bayer Leverkusen; AC Milan; Inter Milan
Mauro Icardi||Sampdoria; Inter Milan; PSG; Galatasaray
Ivan Perišić||Sochaux; Club Brugge; Borussia Dortmund; Wolfsburg; Inter Milan; Bayern Munich; Tottenham; PSV
Francesco Totti|er pupone|Roma
Daniele De Rossi||Roma; Boca Juniors
Gabriel Batistuta|batigol|Newell's Old Boys; River Plate; Boca Juniors; Fiorentina; Roma; Inter Milan
Radja Nainggolan||Cagliari; Roma; Inter Milan
Marek Hamšík||Brescia; Napoli; Dalian Yifang; Trabzonspor
Lorenzo Insigne||Napoli; Pescara; Toronto FC
Dries Mertens||Utrecht; PSV; Napoli; Galatasaray
Kalidou Koulibaly||Metz; Genk; Napoli; Chelsea; Al Hilal
Victor Osimhen||Wolfsburg; Lille; Napoli; Galatasaray
Khvicha Kvaratskhelia|kvara|Napoli; PSG
Scott McTominay||Manchester United; Napoli
Ciro Immobile||Juventus; Genoa; Torino; Borussia Dortmund; Sevilla; Lazio; Beşiktaş; Bologna
Miroslav Klose||Kaiserslautern; Werder Bremen; Bayern Munich; Lazio
Sergej Milinković-Savić|sms|Genk; Lazio; Al Hilal
Hernán Crespo||River Plate; Parma; Lazio; Inter Milan; Chelsea; AC Milan; Genoa
Juan Sebastián Verón||Estudiantes; Boca Juniors; Sampdoria; Parma; Lazio; Manchester United; Chelsea; Inter Milan
Antonio Cassano||Roma; Real Madrid; Sampdoria; AC Milan; Inter Milan; Parma
Luca Toni||Palermo; Fiorentina; Bayern Munich; Roma; Juventus; Verona
Ademola Lookman||Charlton; Everton; RB Leipzig; Fulham; Leicester City; Atalanta
Thomas Müller||Bayern Munich; Vancouver Whitecaps
Manuel Neuer||Schalke 04; Bayern Munich
Philipp Lahm||Bayern Munich; Stuttgart
Bastian Schweinsteiger|schweini|Bayern Munich; Manchester United; Chicago Fire
Franck Ribéry||Metz; Galatasaray; Marseille; Bayern Munich; Fiorentina
Oliver Kahn||Bayern Munich
Lothar Matthäus||Borussia Mönchengladbach; Bayern Munich; Inter Milan
Franz Beckenbauer|der kaiser|Bayern Munich; New York Cosmos; Hamburg
Gerd Müller||Bayern Munich
Joshua Kimmich||RB Leipzig; Bayern Munich
Jamal Musiala||Bayern Munich
Serge Gnabry||Arsenal; West Brom; Werder Bremen; Hoffenheim; Bayern Munich
Kingsley Coman||PSG; Juventus; Bayern Munich; Al Nassr
Leon Goretzka||Schalke 04; Bayern Munich
Alphonso Davies||Vancouver Whitecaps; Bayern Munich
Michael Olise||Reading; Crystal Palace; Bayern Munich
Jérôme Boateng||Hertha Berlin; Hamburg; Manchester City; Bayern Munich; Lyon
Mats Hummels||Bayern Munich; Borussia Dortmund; Roma
Mario Götze||Borussia Dortmund; Bayern Munich; PSV; Eintracht Frankfurt
Marco Reus||Borussia Mönchengladbach; Borussia Dortmund; LA Galaxy
Mario Gómez||Stuttgart; Bayern Munich; Fiorentina; Beşiktaş; Wolfsburg
Xherdan Shaqiri||Basel; Bayern Munich; Inter Milan; Stoke City; Liverpool; Lyon; Chicago Fire
Javi Martínez||Osasuna; Athletic Bilbao; Bayern Munich
Shinji Kagawa||Borussia Dortmund; Manchester United; Beşiktaş; Real Zaragoza
Henrikh Mkhitaryan||Shakhtar Donetsk; Borussia Dortmund; Manchester United; Arsenal; Roma; Inter Milan
Jakub Błaszczykowski|kuba|Borussia Dortmund; Fiorentina; Wolfsburg
Tomáš Rosický||Borussia Dortmund; Arsenal
Julian Brandt||Bayer Leverkusen; Borussia Dortmund
Niclas Füllkrug||Werder Bremen; Nürnberg; Hannover 96; Borussia Dortmund; West Ham
Timo Werner||Stuttgart; RB Leipzig; Chelsea; Tottenham
Christopher Nkunku||PSG; RB Leipzig; Chelsea; AC Milan
Naby Keïta||Red Bull Salzburg; RB Leipzig; Liverpool; Werder Bremen
Jeremie Frimpong||Celtic; Bayer Leverkusen; Liverpool
Victor Boniface||Bayer Leverkusen; Werder Bremen
Randal Kolo Muani||Nantes; Eintracht Frankfurt; PSG; Juventus; Tottenham
Luka Jović||Red Star Belgrade; Benfica; Eintracht Frankfurt; Real Madrid; Fiorentina; AC Milan
Marquinhos||Corinthians; Roma; PSG
Marco Verratti||Pescara; PSG; Al Duhail
Thiago Motta||Barcelona; Atlético Madrid; Genoa; Inter Milan; PSG
Javier Pastore||Palermo; PSG; Roma
Ezequiel Lavezzi|pocho|Napoli; PSG; Hebei China Fortune
Blaise Matuidi||Saint-Étienne; PSG; Juventus; Inter Miami
Pauleta||Deportivo La Coruña; Bordeaux; PSG
Vitinha||Porto; Wolves; PSG
Bradley Barcola||Lyon; PSG
Désiré Doué||Rennes; PSG
Juninho Pernambucano|juninho|Vasco da Gama; Lyon; Al Gharafa; New York Red Bulls
Jean-Pierre Papin|jpp|Club Brugge; Marseille; AC Milan; Bayern Munich; Bordeaux
Didier Deschamps||Nantes; Marseille; Bordeaux; Juventus; Chelsea; Valencia
Marcel Desailly||Nantes; Marseille; AC Milan; Chelsea; Al Gharafa
Laurent Blanc||Montpellier; Napoli; Auxerre; Barcelona; Marseille; Inter Milan; Manchester United
Fabien Barthez||Toulouse; Marseille; Monaco; Manchester United; Nantes
Nicolas Anelka||PSG; Arsenal; Real Madrid; Liverpool; Manchester City; Fenerbahçe; Bolton; Chelsea; Shanghai Shenhua; Juventus; West Brom; Mumbai City
Hatem Ben Arfa||Lyon; Marseille; Newcastle United; Hull City; Nice; PSG; Rennes; Lille
Florian Thauvin||Bordeaux; Marseille; Newcastle United; Udinese; Lens
Mason Greenwood||Manchester United; Getafe; Marseille
Jonathan David||Gent; Lille; Juventus
Nicolas Pépé||Lille; Arsenal; Nice; Trabzonspor; Villarreal
Wissam Ben Yedder||Toulouse; Sevilla; Monaco
Thomas Lemar||Caen; Monaco; Atlético Madrid; Girona
Marc Overmars||Willem II; Ajax; Arsenal; Barcelona
Jaap Stam||Willem II; PSV; Manchester United; Lazio; AC Milan; Ajax
Klaas-Jan Huntelaar||Heerenveen; Ajax; Real Madrid; AC Milan; Schalke 04
Rafael van der Vaart||Ajax; Hamburg; Real Madrid; Tottenham; Real Betis
Dušan Tadić||Groningen; Twente; Southampton; Ajax; Fenerbahçe
Hakim Ziyech||Heerenveen; Twente; Ajax; Chelsea; Galatasaray; Al Duhail
Donny van de Beek||Ajax; Manchester United; Everton; Eintracht Frankfurt; Girona
Georginio Wijnaldum|gini wijnaldum|Feyenoord; PSV; Newcastle United; Liverpool; PSG; Roma; Al Ettifaq
Park Ji-sung||PSV; Manchester United; QPR
Eusébio||Benfica
Rui Costa||Benfica; Fiorentina; AC Milan
João Cancelo||Benfica; Valencia; Inter Milan; Juventus; Manchester City; Bayern Munich; Barcelona; Al Hilal
Rúben Neves||Porto; Wolves; Al Hilal
Hulk||Porto; Zenit; Shanghai SIPG; Atlético Mineiro
Ricardo Quaresma||Sporting CP; Barcelona; Porto; Inter Milan; Chelsea; Beşiktaş
Henrik Larsson||Feyenoord; Celtic; Barcelona; Manchester United
Brian Laudrup||Bayern Munich; Fiorentina; AC Milan; Rangers; Chelsea; Ajax
Michael Laudrup||Juventus; Lazio; Barcelona; Real Madrid; Vissel Kobe; Ajax
Gheorghe Hagi||Real Madrid; Brescia; Barcelona; Galatasaray
Arda Turan||Galatasaray; Atlético Madrid; Barcelona
Alex de Souza|alex|Palmeiras; Cruzeiro; Fenerbahçe
Fernandinho||Shakhtar Donetsk; Manchester City
Douglas Costa||Grêmio; Shakhtar Donetsk; Bayern Munich; Juventus; LA Galaxy
Mykhailo Mudryk||Shakhtar Donetsk; Chelsea
Andrey Arshavin||Zenit; Arsenal
Pelé|pele|Santos; New York Cosmos
Zico||Flamengo; Udinese
Sócrates||Corinthians; Fiorentina; Flamengo; Santos
Gabriel Barbosa|gabigol|Santos; Inter Milan; Benfica; Flamengo; Cruzeiro
Endrick||Palmeiras; Real Madrid; Lyon
Estêvão|estevao willian|Palmeiras; Chelsea
Lucas Paquetá||Flamengo; AC Milan; Lyon; West Ham
Lucas Moura||São Paulo; PSG; Tottenham
Alexandre Pato||Internacional; AC Milan; Corinthians; São Paulo; Chelsea; Villarreal; Orlando City
Ganso|paulo henrique ganso|Santos; São Paulo; Sevilla; Fluminense
Fred||Cruzeiro; Lyon; Fluminense; Atlético Mineiro
Martín Palermo||Estudiantes; Boca Juniors; Villarreal; Real Betis
Pablo Aimar||River Plate; Valencia; Real Zaragoza; Benfica
Javier Saviola||River Plate; Barcelona; Monaco; Sevilla; Real Madrid; Benfica; Málaga; Olympiacos; Verona
Ariel Ortega||River Plate; Valencia; Sampdoria; Parma; Fenerbahçe; Newell's Old Boys
Claudio Caniggia||River Plate; Verona; Atalanta; Roma; Benfica; Boca Juniors; Rangers
Franco Mastantuono||River Plate; Real Madrid
Claudio Echeverri||River Plate; Manchester City; Bayer Leverkusen
Landon Donovan||Bayer Leverkusen; LA Galaxy; Bayern Munich; Everton
Clint Dempsey||Fulham; Tottenham
Weston McKennie||Schalke 04; Juventus; Leeds United
Javier Hernández|chicharito|Manchester United; Real Madrid; Bayer Leverkusen; West Ham; Sevilla; LA Galaxy
Hirving Lozano|chucky lozano|PSV; Napoli
Rafael Márquez||Monaco; Barcelona; New York Red Bulls; Verona
Cuauhtémoc Blanco||Club América; Chicago Fire
Mohamed Elneny||Al Mokawloon; Basel; Arsenal; Beşiktaş; Al Jazira
Mido|ahmed hossam|Zamalek; Gent; Ajax; Celta Vigo; Marseille; Roma; Tottenham; Middlesbrough; Wigan; West Ham; Barnsley
Mohamed Aboutrika|abou trika,aboutreika|Tersana; Al Ahly; Baniyas
Sofyan Amrabat||Utrecht; Feyenoord; Club Brugge; Verona; Fiorentina; Manchester United; Fenerbahçe; Real Betis
Yassine Bounou|bono|Atlético Madrid; Real Zaragoza; Girona; Sevilla; Al Hilal
Emmanuel Adebayor||Metz; Monaco; Arsenal; Manchester City; Real Madrid; Tottenham; Crystal Palace
Kolo Touré||Arsenal; Manchester City; Liverpool; Celtic
Nwankwo Kanu||Ajax; Inter Milan; Arsenal; West Brom; Portsmouth
Asamoah Gyan||Udinese; Rennes; Sunderland; Shanghai SIPG
Thomas Partey||Atlético Madrid; Mallorca; Almería; Arsenal; Villarreal
André Onana||Ajax; Inter Milan; Manchester United; Trabzonspor
Édouard Mendy||Reims; Rennes; Chelsea; Al Ahli
Keisuke Honda||CSKA Moscow; AC Milan; Botafogo
Hidetoshi Nakata||Roma; Parma; Bologna; Fiorentina; Bolton
Kaoru Mitoma||Brighton
Takefusa Kubo||Real Madrid; Mallorca; Villarreal; Getafe; Real Sociedad
Kim Min-jae||Fenerbahçe; Napoli; Bayern Munich
Lee Kang-in||Valencia; Mallorca; PSG
Harry Kewell||Leeds United; Liverpool; Galatasaray
Mark Viduka||Dinamo Zagreb; Celtic; Leeds United; Middlesbrough; Newcastle United
Aitana Bonmatí||Barcelona
Alexia Putellas||Espanyol; Levante; Barcelona
`
};
