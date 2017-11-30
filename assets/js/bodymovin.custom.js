var animation = bodymovin.loadAnimation({
    container: document.getElementById('bm'),
    renderer: 'svg',
    loop: true,
    autoplay: false,
    path: 'assets/json/data.json'
})

animation.addEventListener('DOMLoaded',startAnimation);

function startAnimation(){
    animation.play()
}