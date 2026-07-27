import {Resend} from 'resend';
import { createWelcomeEmailTemplate } from "./emailTemplates.js";
import { ENV } from '../lib/env.js';

const resend = new Resend(ENV.RESEND_API_KEY);
// const from = `${ENV.EMAIL_FROM} <${ENV.EMAIL_FROM_NAME}>`;
const from = "Chatify <onboarding@resend.dev>";

export const sendWelcomeEmail = async (email, name, clientURL) => {
 const {data, error} = await resend.emails.send({
    from ,
    to : email, 
    subject : "Welcome to Chatify",
    html : createWelcomeEmailTemplate(name, clientURL)
 });

 if(error){
    console.log("Error sending welcome email", error);
    throw new Error("Failed to send welcome email");
 }
 console.log("Welcome email sent successfully", data);
}