document.addEventListener('DOMContentLoaded', function() {
    var toggle = document.querySelector('.toggle');
    var image = document.getElementById('image');
    var mis = document.getElementById('mis');
    if (toggle && image && mis) {
        toggle.addEventListener('mouseenter', function() {
            image.classList.toggle('flip');
            mis.style.display = 'inline';
        });
    }
});
