const toggleIcon = document.getElementById('toggle');
const navInfo = document.getElementById('navinfo');




toggleIcon.addEventListener('click', ()=>{
    navInfo.classList.toggle('navinfo-active')
})