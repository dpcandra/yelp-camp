

const stars = document.querySelectorAll('.star');
const ratingInput = document.getElementById('rating');

for (let i = 0; i < stars.length; i++) {
    stars[i].addEventListener('click', function(){
        for (let j = 0; j < stars.length; j++) {
            stars[j].classList.remove('gold-color');
        }
        for (let j = 0; j <= i; j++) {
           stars[j].classList.add('gold-color');
        }
        ratingInput.value = i+1;
        console.log(ratingInput.value);
    });
}