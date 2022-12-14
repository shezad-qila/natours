import axios from "axios";
import Stripe from "stripe";
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51M9UyHSEXiAKeXltpUlATU4i3R12LeYq8VmMmVdqXCPHQJNJ8T35mgoSfwEOiCtHdRzBfkloW05ToW3458G2FXpv00pjx5vxiD');

export const bookTour = async tourId => {
    try{
        // get checkout session from API
        const session = await axios(
            `/api/v1/booking/checkout-session/${tourId}`
        );

        // redirect ot payment page
        // await stripe.redirectToCheckout({
        //     sessionId: session.data.session.id
        // });
        window.location.replace(session.data.session.url)
    }catch(err){
        console.log(err);
        showAlert('error', err);
    }

}; 