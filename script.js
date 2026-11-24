document.documentElement.classList.add('js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
let previousFocus;
function setMenu(open) {
  if (open) previousFocus = document.activeElement;
  document.body.classList.toggle('menu-open', open);
  navigation.inert = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  if (open) navigation.querySelector('a').focus();
  else if (previousFocus) previousFocus.focus({preventScroll:true});
}
menuButton.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (!document.body.classList.contains('menu-open')) return;
  if (event.key === 'Escape') setMenu(false);
  if (event.key === 'Tab') {
    const links = [...navigation.querySelectorAll('a'), menuButton];
    const index = links.indexOf(document.activeElement);
    if (event.shiftKey && index === 0) { event.preventDefault(); links.at(-1).focus(); }
    else if (!event.shiftKey && index === links.length - 1) { event.preventDefault(); links[0].focus(); }
  }
});
const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); reveals.unobserve(entry.target); }
}), {threshold:0.08});
document.querySelectorAll('.reveal').forEach(element => reveals.observe(element));
const approach = document.querySelector('.approach');
const headline = document.querySelector('.moving-headline');
const burst = document.querySelector('.burst');
const approachSticky = document.querySelector('.approach-sticky');
const stars = document.querySelector('.headline-stars');
const headlineComma = document.querySelector('.headline-comma');
const journey = document.querySelector('.journey-scroller');
const track = document.querySelector('.journey-track');
const progressBar = document.querySelector('.journey-progress span');
const heroType = document.querySelector('.hero-type');
const clamp = (v,min=0,max=1) => Math.min(max,Math.max(min,v));
let currentApproach=0, currentJourney=0, ticking=false, metrics={};
function measure() {
  const y=window.scrollY, width=window.innerWidth;
  const approachTop=approach.getBoundingClientRect().top+y;
  const headlineWidth=headline.scrollWidth;
  const travel=headlineWidth*1.035+width*.12;
  const starsCentre=stars.offsetLeft+stars.offsetWidth/2;
  const initialX=width*.35;
  const speed=travel/(window.innerHeight*(width>600?2.6:2.3)*.88);
  const entryDistance=approachTop*.35;
  const releaseDistance=(initialX+starsCentre-width*.5)/(1-.035*starsCentre/travel);
  // Begin the white expansion when the comma enters the reading area.
  const commaPosition=headlineComma.offsetLeft+headlineComma.offsetWidth/2;
  const asteriskStart=(initialX+commaPosition-width*.9)/(1-.035*commaPosition/travel);
  const pinDistance=Math.max(0,(releaseDistance-entryDistance)/speed);
  approach.style.height=reduceMotion.matches?'auto':`${approachSticky.offsetHeight+pinDistance}px`;
  metrics={approachTop,speed,entryDistance,releaseDistance,asteriskStart,initialX,travel,journeyTop:journey.getBoundingClientRect().top+y,journeyRange:Math.max(1,journey.offsetHeight-window.innerHeight),headlineWidth};
  requestTick();
}
function requestTick(){if(!ticking){ticking=true;requestAnimationFrame(draw)}}
function draw(){
  ticking=false;
  if(reduceMotion.matches)return;
  const width=window.innerWidth,y=window.scrollY;
  // Move during the hero exit, through the pin, and throughout its vertical exit.
  const ap=y<metrics.approachTop?y*.35:metrics.entryDistance+(y-metrics.approachTop)*metrics.speed;
  const jp=width>600?clamp((y-metrics.journeyTop)/metrics.journeyRange):0;
  currentApproach+=(ap-currentApproach)*.16;
  currentJourney+=(jp-currentJourney)*.16;
  const headlineScale=1+currentApproach/metrics.travel*.035;
  headline.style.transform=`translate3d(${metrics.initialX-currentApproach}px,0,0) scale(${headlineScale})`;
  const asteriskProgress=clamp((currentApproach-metrics.asteriskStart)/Math.max(1,metrics.releaseDistance-metrics.asteriskStart));
  const scale=Math.pow(asteriskProgress,1.15)*2.1;
  burst.style.visibility=asteriskProgress>0?'visible':'hidden';
  burst.style.transform=`translate(-50%,-50%) scale(${scale})`;
  if(width>600){track.style.transform=`translate3d(${-currentJourney*width*2}px,0,0)`;progressBar.style.transform=`scaleX(${(1+currentJourney*2)/3})`;}else{track.style.transform='none'}
  const hp=clamp(y/window.innerHeight);
  heroType.style.translate=`0 ${hp*40}px`;
  if(Math.abs(currentApproach-ap)>.0001||Math.abs(currentJourney-jp)>.0001)requestTick();
}
window.addEventListener('scroll',requestTick,{passive:true});
window.addEventListener('resize',measure,{passive:true});
reduceMotion.addEventListener('change',measure);
document.fonts.ready.then(measure);
measure();

// Load the verified documentary trailer only after the visitor chooses to play it.
const trailerPlayer=document.querySelector('.trailer-player');
const trailerButton=document.querySelector('.trailer-play');
trailerButton.addEventListener('click',()=>{
  const iframe=document.createElement('iframe');
  iframe.src='https://www.youtube-nocookie.com/embed/'+trailerPlayer.dataset.video+'?autoplay=1&rel=0';
  iframe.title='Against All Odds — Documentary Trailer';
  iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen=true;
  iframe.referrerPolicy='strict-origin-when-cross-origin';
  trailerPlayer.replaceChildren(iframe);
});
