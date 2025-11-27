import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getDailyPrompt() {
  const utcDate = new Date().toISOString().split("T")[0];
  let hash = 0;
  for (let i = 0; i < utcDate.length; i++) {
    hash = utcDate.charCodeAt(i) + ((hash << 5) - hash);
  }
  return prompts[Math.abs(hash) % prompts.length];
}

function getYesterdayPrompt() {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() - 1);
  const yesterday = now.toISOString().split("T")[0];
  let hash = 0;
  for (let i = 0; i < yesterday.length; i++) {
    hash = yesterday.charCodeAt(i) + ((hash << 5) - hash);
  }
  return prompts[Math.abs(hash) % prompts.length];
}

const didYouKnowTips = [
  "You can win even if you're not the first to submit — votes count too!",
  "If someone wins with a lineup you submitted later, you get credit with a Winning Assist.",
  "You only get one vote per day — make it count.",
  "The Most Voted Lineup and the Winner aren’t always the same.",
  "Win 25 days in a row to unlock the Streaker badge!",
  "Streaks reset if you miss a day — don’t break your run!",
  "Early submissions are more likely to earn more votes.",
  "Some badges unlock just by getting 10+ total votes.",
  "A lineup becomes a Deep Cut when the three bands’ combined Spotify followers are under 250,000.",
  "Prompts reset at exactly midnight UTC.",
  "Clicking on your Promoter Rank reveals a special graphic you can share.",
  "If multiple people submit the winning lineup, they all get win credit — but only the first gets the public spotlight.",
  "There’s a “Top 10 Lineups” leaderboard updated in real time.",
  "Winning lineups are featured in the next day’s email.",
  "You unlock the Chart Topper badge after making the Top 10 twenty-five times.",
  "Land in the Top 10, ten times, to unlock your first Chart Topper badge.",
  "Once you've had five winning lineups, you'll unlock the Hit Maker badge.",
  "Your Greatest Hits archive stores your top lineups and stats.",
  "Votes are anonymous — no one knows who voted for what.",
  "You can submit lineups on mobile or desktop — it's fully responsive.",
  "You can only vote for your own lineup after you submit it.",
  "Use niche artists for Deep Cut potential.",
  "After submitting 2 lineups, you can choose your own Promoter nickname.",
  "Winning the day gets you 100 points towards your Global Ranking.",
  "Some prompts feature “Locked Headliners” — keep an eye out!",
  "You get a badge for reaching 10 total wins.",
  "Want better stats? Submit lineups every day.",
  "Your Greatest Hits will always show your most voted lineup.",
  "Share your lineup to get more votes — every fire emoji helps!",
  "Don’t forget to share your lineup on social — your lineup gets additional votes for each person that clicks on it.",
  "Fire = love. The 🔥 icon powers the whole game.",
  "Click on the Spotify logo to open the daily playlist based on the winning lineup.",
  "If your lineup becomes the day’s playlist — that’s legendary.",
  "Total votes, wins, assists, and submissions all factor into milestones.",
  "You’ll see a special popup when you unlock something big.",
  "Miss a day? It doesn’t erase your stats — but it breaks your streak.",
  "Leaderboards update instantly with each vote.",
  "The “Most Voted Lineup” isn’t always the winner — timing matters.",
  "You can only submit one lineup per day.",
  "Prompts are never repeated — every day is brand new.",
  "Landing a lineup in the Top 10 gets you 10 points towards your Global Rank.",
  "Sharing your lineup increases your visibility to other voters.",
  "Got a win? Share your Greatest Hits graphic on socials!",
  "Your Greatest Hits card updates every night at 6:30pm PST.",
  "If your lineup places in the Top 10 five days in a row — badge time.",
  "No need to register — you can play instantly.",
  "Early submissions are more likely to rack up fire votes.",
  "Click on any of the winning lineup artists to hear them on Spotify.",
  "You can re-use a lineup from a previous day — but no guarantee it’ll win again.",
  "Repeat wins with the same trio earn you respect (but no extra badge).",
  "There’s no “wrong” lineup — just different tastes.",
  "Voters love weird mashups — don't be afraid to mix genres.",
  "The best lineups often blend surprise with nostalgia.",
  "Don’t sleep on 2nd Openers — they’re often the key vote-getters.",
  "You can see yesterday’s winner right on the homepage.",
  "Winning Assists only count if someone else wins with your exact lineup.",
  "Total votes + submission order are used to break ties.",
  "Lineups that win multiple days are rare — and legendary.",
  "Want to go viral? Try a lineup that sparks debate.",
  "The best lineups are clever, nostalgic, and surprising.",
  "Try mixing one classic, one niche, and one rising star.",
  "Themed lineups often stand out: all siblings, all duos, all drummers.",
  "Artists don’t have to be alive to be picked — legends are welcome.",
  "Band reunions? Go for it. They don’t have to be together now.",
  "Land in the Top 10 Global Rank and you'll be an Elite Promoter.",
  "Best Concert Ever is built for music obsessives, nerds, and superfans.",
  "If you win on your first day playing — you're a legend.",
  "Want to be the Deep Cut lineup? Submit underrated acts.",
  "Look out for special prompts tied to holidays or music history.",
  "Some prompts are secretly curated by artists or tastemakers.",
  "Don’t forget to vote — submitting alone doesn’t help your ranking.",
  "Some prompts have a Locked Headliner — it can’t be changed.",
  "Your votes help unlock more than just wins — badges count too.",
  "Click any artist featured in a winning lineup to hear them on Spotify.",
  "If your lineup lands in the Top 10 list at the end of the day, that counts for points towards your badges.",
  "Don't clear your browser cache or else you'll lose all your anonymous stats and badge unlocks!",
  "Your Decibel Level is calculated by an artist's radio plays, social media followers, streams and more.",
  "Nail a Decibel Level above 90 and you'll get 10 votes added to your lineup."
];

const didYouKnowTipsMX = [
  "¡Puedes ganar aunque no seas el primero en enviar — los votos también cuentan!",
  "Si alguien gana con una alineación que enviaste después, obtienes crédito con una Asistencia Ganadora.",
  "Solo tienes un voto por día — ¡hazlo valer!",
  "La Alineación Más Votada y el Ganador no siempre son lo mismo.",
  "¡Gana 25 días seguidos para desbloquear la insignia Racha!",
  "Las rachas se reinician si pierdes un día — ¡no rompas tu racha!",
  "Los envíos tempranos tienen más probabilidades de obtener más votos.",
  "Algunas insignias se desbloquean solo con obtener 10+ votos totales.",
  "Una alineación se convierte en Deep Cut cuando los tres artistas tienen menos de 250,000 seguidores combinados en Spotify.",
  "Las prompts se reinician exactamente a la medianoche UTC.",
  "Al hacer clic en tu Rango de Promotor se revela un gráfico especial que puedes compartir.",
  "Si varias personas envían la alineación ganadora, todos obtienen crédito de victoria — pero solo el primero obtiene el reconocimiento público.",
  "Hay una tabla de clasificación \"Top 10 Lineups\" actualizada en tiempo real.",
  "Las alineaciones ganadoras aparecen en el correo del día siguiente.",
  "Desbloqueas la insignia Líder de Listas después de llegar al Top 10 veinticinco veces.",
  "Llega al Top 10 diez veces para desbloquear tu primera insignia Líder de Listas.",
  "Una vez que hayas tenido cinco alineaciones ganadoras, desbloquearás la insignia Ganador.",
  "Tu archivo Greatest Hits almacena tus mejores alineaciones y estadísticas.",
  "Los votos son anónimos — nadie sabe quién votó por qué.",
  "Puedes enviar alineaciones desde móvil o escritorio — es totalmente responsive.",
  "Solo puedes votar por tu propia alineación después de enviarla.",
  "Usa artistas de nicho para potencial Deep Cut.",
  "Después de enviar 2 alineaciones, puedes elegir tu propio apodo de Promotor.",
  "Ganar el día te da 100 puntos para tu Ranking Global.",
  "¡Algunas prompts tienen \"Headliners Bloqueados\" — estate atento!",
  "Obtienes una insignia al llegar a 10 victorias totales.",
  "¿Quieres mejores estadísticas? Envía alineaciones todos los días.",
  "Tu Greatest Hits siempre mostrará tu alineación más votada.",
  "¡Comparte tu alineación para obtener más votos — cada emoji de fuego ayuda!",
  "No olvides compartir tu alineación en redes sociales — tu alineación obtiene votos adicionales por cada persona que haga clic en ella.",
  "Fuego = amor. El ícono 🔥 impulsa todo el juego.",
  "Haz clic en el logo de Spotify para abrir la playlist diaria basada en la alineación ganadora.",
  "Si tu alineación se convierte en la playlist del día — eso es legendario.",
  "Los votos totales, victorias, asistencias y envíos se suman para los hitos.",
  "Verás un popup especial cuando desbloquees algo grande.",
  "¿Perdiste un día? No borra tus estadísticas — pero rompe tu racha.",
  "Las tablas de clasificación se actualizan instantáneamente con cada voto.",
  "La \"Alineación Más Votada\" no siempre es la ganadora — el tiempo importa.",
  "Solo puedes enviar una alineación por día.",
  "Las prompts nunca se repiten — cada día es completamente nuevo.",
  "Colocar una alineación en el Top 10 te da 10 puntos para tu Rango Global.",
  "Compartir tu alineación aumenta tu visibilidad ante otros votantes.",
  "¿Ganaste? ¡Comparte tu gráfico Greatest Hits en redes sociales!",
  "Tu tarjeta Greatest Hits se actualiza cada noche a las 6:30pm PST.",
  "Si tu alineación se coloca en el Top 10 cinco días seguidos — ¡hora de insignia!",
  "No necesitas registrarte — puedes jugar instantáneamente.",
  "Los envíos tempranos tienen más probabilidades de acumular votos de fuego.",
  "Haz clic en cualquiera de los artistas de la alineación ganadora para escucharlos en Spotify.",
  "Puedes reutilizar una alineación de un día anterior — pero no hay garantía de que gane de nuevo.",
  "Las victorias repetidas con el mismo trío te ganan respeto (pero ninguna insignia extra).",
  "No hay alineación \"incorrecta\" — solo gustos diferentes.",
  "A los votantes les encantan las mezclas extrañas — no tengas miedo de mezclar géneros.",
  "Las mejores alineaciones a menudo combinan sorpresa con nostalgia.",
  "No subestimes a los 2nd Openers — a menudo son los que obtienen votos clave.",
  "Puedes ver al ganador de ayer en la página de inicio.",
  "Las Asistencias Ganadoras solo cuentan si alguien más gana con tu alineación exacta.",
  "Los votos totales + orden de envío se usan para desempatar.",
  "Las alineaciones que ganan múltiples días son raras — y legendarias.",
  "¿Quieres volverte viral? Prueba una alineación que genere debate.",
  "Las mejores alineaciones son inteligentes, nostálgicas y sorprendentes.",
  "Intenta mezclar un clásico, uno de nicho y una estrella emergente.",
  "Las alineaciones temáticas a menudo se destacan: todos hermanos, todos dúos, todos bateristas.",
  "Los artistas no tienen que estar vivos para ser elegidos — las leyendas son bienvenidas.",
  "¿Reuniones de bandas? Adelante. No tienen que estar juntos ahora.",
  "Llega al Top 10 del Ranking Global y serás un Promotor de Élite.",
  "Best Concert Ever está hecho para obsesivos de la música, nerds y superfans.",
  "Si ganas en tu primer día jugando — eres una leyenda.",
  "¿Quieres ser la alineación Deep Cut? Envía artistas subestimados.",
  "Estate atento a prompts especiales vinculadas a días festivos o historia musical.",
  "Algunas prompts son curadas secretamente por artistas o tastemakers.",
  "No olvides votar — solo enviar no ayuda a tu ranking.",
  "Algunas prompts tienen un Headliner Bloqueado — no se puede cambiar.",
  "Tus votos ayudan a desbloquear más que victorias — las insignias también cuentan.",
  "Haz clic en cualquier artista destacado en una alineación ganadora para escucharlo en Spotify.",
  "Si tu alineación llega a la lista Top 10 al final del día, eso cuenta para puntos hacia tus insignias.",
  "¡No borres la caché de tu navegador o perderás todas tus estadísticas anónimas y desbloqueos de insignias!",
  "Tu Nivel de Decibeles se calcula según las reproducciones en radio, seguidores en redes sociales, streams y más de un artista.",
  "Consigue un Nivel de Decibeles superior a 90 y obtendrás 10 votos agregados a tu alineación."
];

const didYouKnowTipsBR = [
  "Você pode ganhar mesmo que não seja o primeiro a enviar — os votos também contam!",
  "Se alguém ganhar com uma lineup que você enviou depois, você recebe crédito com uma Assistência Vencedora.",
  "Você só tem um voto por dia — faça valer!",
  "A Lineup Mais Votada e o Vencedor nem sempre são os mesmos.",
  "Ganhe 25 dias seguidos para desbloquear o distintivo Sequência!",
  "As sequências são reiniciadas se você perder um dia — não quebre sua sequência!",
  "Envios antecipados têm mais chances de ganhar mais votos.",
  "Alguns distintivos são desbloqueados apenas obtendo 10+ votos totais.",
  "Uma lineup se torna um Deep Cut quando os três artistas têm menos de 250.000 seguidores combinados no Spotify.",
  "Os desafios são reiniciados exatamente à meia-noite UTC.",
  "Clicar no seu Ranking de Promotor revela um gráfico especial que você pode compartilhar.",
  "Se várias pessoas enviarem a lineup vencedora, todos recebem crédito de vitória — mas apenas o primeiro recebe o destaque público.",
  "Há uma tabela de classificação 'Top 10 Lineups' atualizada em tempo real.",
  "Lineups vencedoras são destaque no e-mail do dia seguinte.",
  "Você desbloqueia o distintivo Líder das Paradas depois de chegar ao Top 10 vinte e cinco vezes.",
  "Chegue ao Top 10 dez vezes para desbloquear seu primeiro distintivo Líder das Paradas.",
  "Depois de ter cinco lineups vencedoras, você desbloqueará o distintivo Criador de Hits.",
  "Seu arquivo Greatest Hits armazena suas melhores lineups e estatísticas.",
  "Os votos são anônimos — ninguém sabe quem votou em quê.",
  "Você pode enviar lineups no celular ou desktop — é totalmente responsivo.",
  "Você só pode votar na sua própria lineup depois de enviá-la.",
  "Use artistas de nicho para potencial Deep Cut.",
  "Depois de enviar 2 lineups, você pode escolher seu próprio apelido de Promotor.",
  "Ganhar o dia dá 100 pontos para o seu Ranking Global.",
  "Alguns desafios apresentam 'Headliners Bloqueados' — fique de olho!",
  "Você ganha um distintivo ao atingir 10 vitórias totais.",
  "Quer estatísticas melhores? Envie lineups todos os dias.",
  "Seu Greatest Hits sempre mostrará sua lineup mais votada.",
  "Compartilhe sua lineup para obter mais votos — cada emoji de fogo ajuda!",
  "Não se esqueça de compartilhar sua lineup nas redes sociais — sua lineup recebe votos adicionais para cada pessoa que clicar nela.",
  "Fogo = amor. O ícone 🔥 alimenta todo o jogo.",
  "Clique no logo do Spotify para abrir a playlist diária baseada na lineup vencedora.",
  "Se sua lineup se tornar a playlist do dia — isso é lendário.",
  "Votos totais, vitórias, assistências e envios são considerados para os marcos.",
  "Você verá um popup especial quando desbloquear algo grande.",
  "Perdeu um dia? Não apaga suas estatísticas — mas quebra sua sequência.",
  "As tabelas de classificação são atualizadas instantaneamente com cada voto.",
  "A 'Lineup Mais Votada' nem sempre é a vencedora — o tempo importa.",
  "Você só pode enviar uma lineup por dia.",
  "Os desafios nunca se repetem — cada dia é completamente novo.",
  "Colocar uma lineup no Top 10 dá 10 pontos para o seu Ranking Global.",
  "Compartilhar sua lineup aumenta sua visibilidade para outros eleitores.",
  "Conseguiu uma vitória? Compartilhe seu gráfico Greatest Hits nas redes sociais!",
  "Seu cartão Greatest Hits é atualizado todas as noites às 18h30 PST.",
  "Se sua lineup ficar no Top 10 cinco dias seguidos — hora do distintivo.",
  "Não precisa se registrar — você pode jogar instantaneamente.",
  "Envios antecipados têm mais chances de acumular votos de fogo.",
  "Clique em qualquer um dos artistas da lineup vencedora para ouvi-los no Spotify.",
  "Você pode reutilizar uma lineup de um dia anterior — mas não há garantia de que ela ganhará novamente.",
  "Vitórias repetidas com o mesmo trio ganham respeito (mas nenhum distintivo extra).",
  "Não há lineup 'errada' — apenas gostos diferentes.",
  "Os eleitores adoram mashups estranhos — não tenha medo de misturar gêneros.",
  "As melhores lineups geralmente misturam surpresa com nostalgia.",
  "Não subestime as 2ª Aberturas — elas são frequentemente as principais conquistadoras de votos.",
  "Você pode ver o vencedor de ontem direto na página inicial.",
  "Assistências Vencedoras só contam se outra pessoa ganhar com sua lineup exata.",
  "Votos totais + ordem de envio são usados para desempate.",
  "Lineups que ganham vários dias são raras — e lendárias.",
  "Quer viralizar? Tente uma lineup que provoque debate.",
  "As melhores lineups são inteligentes, nostálgicas e surpreendentes.",
  "Tente misturar um clássico, um nicho e uma estrela em ascensão.",
  "Lineups temáticas geralmente se destacam: todos irmãos, todas duplas, todos bateristas.",
  "Os artistas não precisam estar vivos para serem escolhidos — lendas são bem-vindas.",
  "Reuniões de bandas? Vá em frente. Elas não precisam estar juntas agora.",
  "Chegue ao Top 10 do Ranking Global e você será um Promotor de Elite.",
  "Best Concert Ever é feito para obcecados por música, nerds e superfãs.",
  "Se você ganhar no seu primeiro dia jogando — você é uma lenda.",
  "Quer ser a lineup Deep Cut? Envie artistas subestimados.",
  "Fique atento a desafios especiais ligados a feriados ou história da música.",
  "Alguns desafios são secretamente curados por artistas ou formadores de opinião.",
  "Não se esqueça de votar — apenas enviar não ajuda seu ranking.",
  "Alguns desafios têm um Headliner Bloqueado — não pode ser alterado.",
  "Seus votos ajudam a desbloquear mais do que apenas vitórias — os distintivos também contam.",
  "Clique em qualquer artista apresentado em uma lineup vencedora para ouvi-lo no Spotify.",
  "Se sua lineup entrar na lista Top 10 no final do dia, isso conta para pontos nos seus distintivos.",
  "Não limpe o cache do seu navegador ou você perderá todas as suas estatísticas anônimas e desbloqueios de distintivos!",
  "Seu Nível de Decibéis é calculado pelas reproduções de rádio, seguidores nas redes sociais, streams e muito mais de um artista.",
  "Consiga um Nível de Decibéis acima de 90 e você terá 10 votos adicionados à sua lineup."
];

function getDailyDidYouKnowTip(market = 'US') {
  const tips = market === 'MX' ? didYouKnowTipsMX 
           : market === 'BR' ? didYouKnowTipsBR 
           : didYouKnowTips;
  const today = new Date().toISOString().split("T")[0];
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = today.charCodeAt(i) + ((hash << 5) - hash);
  }
  return tips[Math.abs(hash) % tips.length];
}

async function getSpotifyImageUrl(artistName) {
  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials'
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const searchData = await searchRes.json();
    const artist = searchData.artists?.items?.[0];
    return artist?.images?.[0]?.url || `https://via.placeholder.com/300x300?text=${encodeURIComponent(artistName)}`;
  } catch (err) {
    console.error(`Error fetching Spotify image for ${artistName}:`, err);
    return `https://via.placeholder.com/300x300?text=${encodeURIComponent(artistName)}`;
  }
}


function buildNewsletterHtml({
  dailyPrompt,
  yesterdayPrompt,
  headlinerImg,
  secondOpenerImg,
  openerImg,
  rawHeadliner,
  rawSecondOpener,
  rawOpener,
  playlistUrl,
  dailyTip,
  market = 'US'
}) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757150384/img-3_j1stcs.jpg"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757151925/Group_14_fzk6o6.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757151713/Group_13_udwivy.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163833/Yesterday_s_winning_lineup_n0jhza.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757162970/down-zigzag_ivdxyt.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757150411/band-3_h3gklz.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163828/Headliner_ppkp4r.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757150411/band-2_hlrsps.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163827/2nd_Opener_bzgaxi.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757150411/band-1_vf3lj5.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163829/Opener_e2xbpw.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757162969/up-zigzag_yncjjs.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757164433/spotify_safuoq.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757172212/stream-the-winning-lineups_kytpbr.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757170445/button_bzg5o2.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757166457/IMG_1869_r6sg4i.jpg"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757167604/crowd_jf7bcu.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757167034/best-concert-ever_i4wbjt.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757167032/ig_sirgwm.png"
    />
    <link
      rel="preload"
      as="image"
      href="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757167033/x_d0d6oy.png"
    />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <!--$-->
  </head>
  <body
    class="darkmode"
    style="
      font-family: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji',
        'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
      background-color: rgb(28, 28, 28) !important;
      padding-top: 0.5rem;
    "
  >
    <table
      align="center"
      width="100%"
      class="darkmode"
      border="0"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="
        background-color: rgb(0, 0, 0) !important;
        max-width: 600px !important;
      "
    >
      <tbody>
        <tr style="width: 100%">
          <td>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="margin: 0px !important"
            >
              <tbody>
                <tr>
                  <td>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757150384/img-3_j1stcs.jpg"
                      style="
                        width: 600px;
                        display: inline-block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                margin-top: 0px !important;
                background-image: url(&#x27;https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757151328/Rectangle_48_j4qmze.png&#x27;);
                background-size: auto;
                background-position: center;
                background-repeat: no-repeat;
                width: 600px;
                height: 300px;
              "
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        margin-top: 3rem !important;
                        background-image: url(&#x27;https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757156915/concert-ticket_utkrgk.png&#x27;);
                        background-repeat: no-repeat;
                        background-position: center top;
                        background-size: 550px auto;
                        width: 550px;
                        height: 230px;
                        position: relative;
                      "
                    >
                      <tbody>
                        <tr>
                          <td>
                            <p
                              style="
                                margin-left: 1.25rem !important;
                                margin-bottom: 5rem !important;
                                font-size: 1.25rem;
                                line-height: 1.75rem;
                                font-weight: 600;
                                color: rgb(255, 255, 255);
                                margin: 16px 0;
                              "
                            >
                              ${dailyPrompt}
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                background-color: rgb(255, 255, 255);
                padding-top: 1rem;
                padding-bottom: 1rem;
                padding-left: 1rem;
                padding-right: 1rem;
              "
            >
              <tbody>
                <tr>
                  <td>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757151925/Group_14_fzk6o6.png"
                      style="
                        height: 0.5rem;
                        margin-left: auto;
                        margin-right: auto;
                        margin-top: 2rem !important;
                        margin-bottom: 2rem !important;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    /><img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757151713/Group_13_udwivy.png"
                      style="
                        height: 7rem;
                        margin-left: auto;
                        margin-right: auto;
                        margin-bottom: 1.5rem;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    /><img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163833/Yesterday_s_winning_lineup_n0jhza.png"
                      style="
                        height: 1.75rem;
                        margin-left: auto;
                        margin-right: auto;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                    <p
                      style="
                        margin-bottom: 2.5rem !important;
                        font-size: 1.875rem;
                        line-height: 2.25rem;
                        font-weight: 600;
                        text-align: center;
                        margin: 16px 0;
                      "
                    >
                      ${yesterdayPrompt}
                    </p>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757151925/Group_14_fzk6o6.png"
                      style="
                        height: 0.5rem;
                        margin-left: auto;
                        margin-right: auto;
                        margin-bottom: 2rem !important;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="background-color: rgb(255, 177, 37)"
            >
              <tbody>
                <tr>
                  <td>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757162970/down-zigzag_ivdxyt.png"
                      style="
                        width: 100%;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="padding-top: 2.5rem; padding-bottom: 2.5rem"
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table
                              align="center"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="margin-bottom: 1.5rem"
                            >
                              <tbody style="width: 100%">
                                <tr style="width: 100%">
                                  <td
                                    width="55%"
                                    data-id="__react-email-column"
                                  >
                                    <table
                                      align="center"
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        padding-left: 1rem;
                                        padding-right: 1rem;
                                      "
                                    >
                                      <tbody>
                                        <tr>
                                          <td>
                                            <img
                                              src="${headlinerImg}"
                                              style="
                                                width: 100%;
                                                border-radius: 0.75rem;
                                                display: block;
                                                outline: none;
                                                border: none;
                                                text-decoration: none;
                                              "
                                            />
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                  <td
                                    width="45%"
                                    data-id="__react-email-column"
                                  >
                                    <table
                                      align="center"
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                    >
                                      <tbody>
                                        <tr>
                                          <td>
                                            <img
                                              src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163828/Headliner_ppkp4r.png"
                                              style="
                                                height: 1.5rem;
                                                display: block;
                                                outline: none;
                                                border: none;
                                                text-decoration: none;
                                              "
                                            />
                                            <p
                                              style="
                                                font-size: 1.2rem;
                                                font-weight: 700;
                                                line-height: 24px;
                                                margin: 16px 0;
                                              "
                                            >
                                              ${rawHeadliner}
                                            </p>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table
                              align="center"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="margin-bottom: 1.5rem"
                            >
                              <tbody style="width: 100%">
                                <tr style="width: 100%">
                                  <td
                                    width="55%"
                                    data-id="__react-email-column"
                                  >
                                    <table
                                      align="center"
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        padding-left: 1rem;
                                        padding-right: 1rem;
                                      "
                                    >
                                      <tbody>
                                        <tr>
                                          <td>
                                            <img
                                              src="${secondOpenerImg}"
                                              style="
                                                width: 100%;
                                                border-radius: 0.75rem;
                                                display: block;
                                                outline: none;
                                                border: none;
                                                text-decoration: none;
                                              "
                                            />
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                  <td
                                    width="45%"
                                    data-id="__react-email-column"
                                  >
                                    <table
                                      align="center"
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                    >
                                      <tbody>
                                        <tr>
                                          <td>
                                            <img
                                              src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163827/2nd_Opener_bzgaxi.png"
                                              style="
                                                height: 1.5rem;
                                                display: block;
                                                outline: none;
                                                border: none;
                                                text-decoration: none;
                                              "
                                            />
                                            <p
                                              style="
                                                font-size: 1.2rem;
                                                font-weight: 700;
                                                line-height: 24px;
                                                margin: 16px 0;
                                              "
                                            >
                                              ${rawSecondOpener}
                                            </p>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table
                              align="center"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                            >
                              <tbody style="width: 100%">
                                <tr style="width: 100%">
                                  <td
                                    width="55%"
                                    data-id="__react-email-column"
                                  >
                                    <table
                                      align="center"
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        padding-left: 1rem;
                                        padding-right: 1rem;
                                      "
                                    >
                                      <tbody>
                                        <tr>
                                          <td>
                                            <img
                                              src="${openerImg}"
                                              style="
                                                width: 100%;
                                                border-radius: 0.75rem;
                                                display: block;
                                                outline: none;
                                                border: none;
                                                text-decoration: none;
                                              "
                                            />
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                  <td
                                    width="45%"
                                    data-id="__react-email-column"
                                  >
                                    <table
                                      align="center"
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                    >
                                      <tbody>
                                        <tr>
                                          <td>
                                            <img
                                              src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757163829/Opener_e2xbpw.png"
                                              style="
                                                height: 1.5rem;
                                                display: block;
                                                outline: none;
                                                border: none;
                                                text-decoration: none;
                                              "
                                            />
                                            <p
                                              style="
                                                font-size: 1.2rem;
                                                font-weight: 700;
                                                line-height: 24px;
                                                margin: 16px 0;
                                              "
                                            >
                                              ${rawOpener}
                                            </p>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757162969/up-zigzag_yncjjs.png"
                      style="
                        width: 100%;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                background-color: rgb(255, 255, 255);
                padding-top: 1.5rem;
                padding-bottom: 1.5rem;
                text-align: center;
              "
            >
              <tbody>
                <tr>
                  <td>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757164433/spotify_safuoq.png"
                      style="
                        margin-left: auto;
                        margin-right: auto;
                        height: 3.5rem;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    /><img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757172212/stream-the-winning-lineups_kytpbr.png"
                      style="
                        margin-left: auto;
                        margin-right: auto;
                        height: 1.75rem;
                        padding-top: 1rem;
                        padding-bottom: 1rem;
                        margin-bottom: 1rem;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                    <div
                      style="
                        padding-top: 0.75rem;
                        padding-bottom: 0.75rem;
                        padding-left: 0.5rem;
                        padding-right: 0.5rem;
                        text-align: center;
                        font-size: 1rem;
                        font-weight: 600;
                        width: 85%;
                        margin-left: auto;
                        margin-right: auto;
                        border-radius: 1rem;
                        margin-bottom: 2rem;
                        border: 2px dashed #62748e;
                      "
                    >
                      <p
                        style="
                          font-size: 1.15rem;
                          line-height: 24px;
                          margin: 16px 0;
                        "
                      >
                        <a href="${playlistUrl}" style="color:#000; text-decoration:underline; font-weight:700;">${yesterdayPrompt}.Playlist.Ever</a>
                      </p>
                    </div>
                    <p
                      style="
                        font-size: 1.15rem;
                        color: rgb(38, 38, 38);
                        text-align: center;
                        margin-bottom: 1.5rem !important;
                        line-height: 24px;
                        margin: 16px 0;
                      "
                    >
                      ${market === 'MX' ? '¿Crees que tienes lo necesario para ser el Promotor Musical definitivo?' : market === 'BR' ? 'Você acha que tem o que é preciso para ser o Promotor Musical definitivo?' : 'Think you have what it takes to be the ultimate Music Promoter?'}
                    </p>
                    <a
                      href="https://bestconcertevergame.com"
                      style="color: #067df7; text-decoration-line: none"
                      target="_blank"
                      ><img
                        src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757170445/button_bzg5o2.png"
                        style="
                          height: 7rem;
                          vertical-align: middle;
                          display: inline-block;
                          margin-left: 0.5rem;
                          outline: none;
                          border: none;
                          text-decoration: none;
                        "
                    /></a>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="background-color: rgb(250, 223, 106)"
            >
              <tbody>
                <tr>
                  <td>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757162970/down-zigzag_ivdxyt.png"
                      style="
                        width: 100%;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        margin-top: 2rem;
                        margin-bottom: 2rem;
                        padding-top: 1.5rem;
                        padding-bottom: 1.5rem;
                        width: 85%;
                        border-radius: 1rem;
                        border: 2px solid #404040;
                      "
                    >
                      <tbody>
                        <tr>
                          <td>
                            <img
                              src="${market === 'MX' ? 'https://best-concert-ever.vercel.app/email-assets/sabiasque.png?v=20250806' : market === 'BR' ? 'https://best-concert-ever.vercel.app/email-assets/vocesabia.png?v=20250806' : 'https://best-concert-ever.vercel.app/email-assets/didyouknow.png?v=20250806'}"
                              style="
                                height: 11.25rem;
                                margin-left: auto;
                                margin-right: auto;
                                display: block;
                                outline: none;
                                border: none;
                                text-decoration: none;
                              "
                            />
                            <p
                              style="
                                font-size: 1.15rem;
                                text-align: center;
                                font-weight: 600;
                                line-height: 24px;
                                margin: 16px 0;
                              "
                            >
                              ${dailyTip}
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="background-color: rgb(2, 2, 1); padding-bottom: 2rem"
            >
              <tbody>
                <tr>
                  <td>
                    <img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757167604/crowd_jf7bcu.png"
                      style="width: 100%; margin-left: auto; margin-right: auto"
                    /><img
                      src="https://res.cloudinary.com/dvlvsnf5f/image/upload/v1757167034/best-concert-ever_i4wbjt.png"
                      style="
                        height: 8rem;
                        margin-left: auto;
                        margin-right: auto;
                        margin-top: 1rem;
                        margin-bottom: 0.5rem;
                        display: block;
                        outline: none;
                        border: none;
                        text-decoration: none;
                      "
                    />
                    <hr
                      style="
                        height: 1px;
                        width: 60%;
                        margin-left: auto;
                        margin-right: auto;
                        background-color: rgb(204, 204, 204);
                        border-radius: 9999px;
                        margin-top: 2.5rem;
                        border: none;
                        border-top: 1px solid #eaeaea;
                      "
                    />
                    <p
                      style="
                        color: rgb(255, 255, 255);
                        font-size: 1.25rem;
                        text-align: center;
                        line-height: 24px;
                        margin: 16px 0;
                      "
                    >
                      ${market === 'MX' ? 'Síguenos en redes sociales:' : market === 'BR' ? 'Siga-nos nas redes sociais:' : 'Follow us on social:'}
                    </p>
                    <!-- Follow us on social: -->
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
  <tbody style="width:100%">
    <tr style="width:100%">
      <td align="center" style="padding-top:8px; padding-bottom:16px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tbody>
            <tr>
              <!-- Instagram -->
              <td style="padding:0 6px;">
                <a href="https://www.instagram.com/bestconcertevergame" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                  <img
                    src="https://bestconcertevergame.com/icons/yellowinstagram.png"
                    alt="Instagram"
                    height="32"
                    style="height:2rem; display:block; outline:none; border:none; text-decoration:none;"
                  />
                </a>
              </td>

              <!-- X (Twitter) -->
              <td style="padding:0 6px;">
                <a href="https://x.com/bestconcertgame" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                  <img
                    src="https://bestconcertevergame.com/icons/yellowtwitter.png"
                    alt="X (Twitter)"
                    height="32"
                    style="height:2rem; display:block; outline:none; border:none; text-decoration:none;"
                  />
                </a>
              </td>

              <!-- Facebook -->
              <td style="padding:0 6px;">
                <a href="https://www.facebook.com/profile.php?id=61578292247052" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                  <img
                    src="https://bestconcertevergame.com/icons/yellowfacebook.png"
                    alt="Facebook"
                    height="32"
                    style="height:2rem; display:block; outline:none; border:none; text-decoration:none;"
                  />
                </a>
              </td>

              <!-- Spotify -->
              <td style="padding:0 6px;">
                <a href="https://open.spotify.com/user/31sfywg7ipefpaaldvcpv3jzuc4i?si=2706474725af44b2" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                  <img
                    src="https://bestconcertevergame.com/icons/yellowspotify.png"
                    alt="Spotify"
                    height="32"
                    style="height:2rem; display:block; outline:none; border:none; text-decoration:none;"
                  />
                </a>
              </td>

              <!-- TikTok -->
              <td style="padding:0 6px;">
                <a href="https://www.tiktok.com/@bestconcertever" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                  <img
                    src="https://bestconcertevergame.com/icons/yellowtiktok.png"
                    alt="TikTok"
                    height="32"
                    style="height:2rem; display:block; outline:none; border:none; text-decoration:none;"
                  />
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="background-color: rgb(255, 255, 255)"
            >
              <tbody>
                <tr>
                  <td>
                   <p
                      style="
                        color: rgb(64, 64, 64);
                        font-weight: 600;
                        text-align: center;
                        font-size: 0.9rem;
                        line-height: 24px;
                        margin: 16px 0;
                      "
                    >
                      ${market === 'MX' ? '¿No quieres recibir estos correos?' : market === 'BR' ? 'Não quer receber estes e-mails?' : "Don&#x27;t want to receive these emails?"}<!-- -->
                      <a
                        href="https://bestconcertevergame.com/unsubscribe"
                        style="color: #067df7; text-decoration-line: none"
                        target="_blank"
                         href="https://bestconcertevergame.com/unsubscribe">${market === 'MX' ? 'Cancelar suscripción' : market === 'BR' ? 'Cancelar inscrição' : 'Unsubscribe'}</a
                      >
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--/$-->
  </body>
</html>
`;
}


export default async function handler(req, res) {
  const testEmail = req.query.testEmail || req.body?.testEmail;
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const today = new Date();
  const cutoff = new Date("2025-05-01T00:00:00Z");

  // Helper: Get prompts for a specific market
  async function getPromptsForMarket(market) {
    const todayStr = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const tableName = market === 'MX' ? 'prompts_mx' 
               : market === 'BR' ? 'prompts_br'
               : 'prompts';
    const { data: todayData } = await supabase.from(tableName).select("prompt").eq("prompt_date", todayStr).single();
    const { data: yesterdayData } = await supabase.from(tableName).select("prompt").eq("prompt_date", yesterdayStr).single();

    return {
      dailyPrompt: todayData?.prompt || getDailyPrompt(),
      yesterdayPrompt: yesterdayData?.prompt || getYesterdayPrompt()
    };
  }

  // Helper: Get winner for a specific market
  async function getWinnerForMarket(market, yesterdayPrompt) {
    const { data, error } = await supabase
      .from('lineups')
      .select('headliner, opener, second_opener, votes')
      .eq('prompt', yesterdayPrompt)
      .eq('market', market);

    if (error || !data || data.length === 0) {
      return null;
    }

    const countMap = {};
    data.forEach(({ headliner, opener, second_opener, votes }) => {
      const key = `${headliner?.name}|||${opener?.name}|||${second_opener?.name}`;
      countMap[key] = (countMap[key] || 0) + 1 + (votes || 0);
    });

    const maxCount = Math.max(...Object.values(countMap));
    const topLineups = Object.entries(countMap).filter(([_, count]) => count === maxCount);
    const [rawHeadliner, rawOpener, rawSecondOpener] = topLineups[Math.floor(Math.random() * topLineups.length)][0].split("|||");

    return { rawHeadliner, rawOpener, rawSecondOpener };
  }

  // Get subscribers grouped by market
  const { data: subscribersData } = await supabase
    .from("subscribers")
    .select("email, market");

  if (!subscribersData || subscribersData.length === 0) {
    console.error("No recipients found.");
    return res.status(500).json({ message: "No recipients found" });
  }

  // Group by market
  let subscribersByMarket = subscribersData.reduce((acc, sub) => {
    const market = sub.market || 'US';
    if (!acc[market]) acc[market] = [];
    acc[market].push(sub.email);
    return acc;
  }, {});

  // Override for testing
const testMarket = req.query.testMarket || req.body?.testMarket || 'US';

if (testEmail) {
  subscribersByMarket = { [testMarket]: [testEmail] };
}

  const chunkArray = (arr, size) =>
    arr.length > size
      ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
      : [arr];

  try {
    // Loop through each market and send market-specific emails
    for (const [market, emails] of Object.entries(subscribersByMarket)) {
      console.log(`📧 Processing ${emails.length} emails for ${market} market`);

      // Get market-specific prompts
      const { dailyPrompt, yesterdayPrompt } = today >= cutoff 
        ? await getPromptsForMarket(market)
        : { dailyPrompt: getDailyPrompt(), yesterdayPrompt: getYesterdayPrompt() };

      // Get market-specific winner
      const winner = await getWinnerForMarket(market, yesterdayPrompt);
      
      if (!winner) {
        console.log(`⚠️ No winner for ${market}, skipping...`);
        continue;
      }

      const { rawHeadliner, rawOpener, rawSecondOpener } = winner;

      // Fetch Spotify images
      const [headlinerImg, openerImg, secondOpenerImg] = await Promise.all([
        getSpotifyImageUrl(rawHeadliner),
        getSpotifyImageUrl(rawOpener),
        getSpotifyImageUrl(rawSecondOpener)
      ]);

      const playlistSlug = `${yesterdayPrompt.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}-playlist-ever`;
      const playlistUrl = `https://open.spotify.com/user/31sfywg7ipefpaaldvcpv3jzuc4i?si=11fb7c92a53744e0/${playlistSlug}`;
      const dailyTip = getDailyDidYouKnowTip(market);

      // Build HTML (your existing template, unchanged)
      const html = buildNewsletterHtml({ 
        dailyPrompt, 
        yesterdayPrompt, 
        headlinerImg, 
        secondOpenerImg, 
        openerImg, 
        rawHeadliner, 
        rawSecondOpener, 
        rawOpener, 
        playlistUrl, 
        dailyTip,
        market 
      });

     const subject = market === 'MX' 
  ? `🎺 ¿Cuál es Tu Mejor Concierto de la Historia para "${dailyPrompt}"?`
  : market === 'BR'
  ? `🎺 Qual é Seu Melhor Show de Todos os Tempos para "${dailyPrompt}"?`
  : `🎺 What's Your Best Concert Ever for "${dailyPrompt}"?`;

const messages = emails.map((email) => ({
  from: 'Best Concert Ever <noreply@bestconcertevergame.com>',
  to: [email],
  subject,
  html,
}));

      const messageChunks = chunkArray(messages, 99);

      for (const chunk of messageChunks) {
        await resend.batch.send(chunk);
        console.log(`✅ Sent ${chunk.length} ${market} emails`);
      }
    }

    return res.status(200).json({ message: "Emails sent for all markets" });
  } catch (err) {
    console.error("❌ Email send failed:", err);
    return res.status(500).json({ message: "Email send failed" });
 }
}