import '@babel/polyfill';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

// DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const logoutUser = document.querySelector('.nav__el--logout');
const userData = document.querySelector('.form-user-data');
const userPassword = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');

// login
if(loginForm){
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
};

// logout
if(logoutUser) logoutUser.addEventListener('click', logout);

// Update User Data
if(userData){
    userData.addEventListener('submit', e => {
        e.preventDefault();

        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);

        updateSettings( form, 'data');
    });
}

// Change User Password
if(userPassword){
    userPassword.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save--password').textContent = 'Updating....';

        const currentPassword = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings( {currentPassword, password, passwordConfirm}, 'password');

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
        document.querySelector('.btn--save--password').textContent = 'Save Password';
    });
}

if(bookBtn)
    bookBtn.addEventListener('click', e => {
        // const tourId = e.target.dataset.tourId;
        e.target.textContent = 'Processing';
        const { tourId } = e.target.dataset;
        bookTour(tourId);
    });