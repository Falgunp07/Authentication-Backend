export function generateOtp(){
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpHtml(otp){
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">  
    <style>
        body{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                display: flex; 
                justify-content: center;
                align-items: center;
                height: 100vh;  
            }

        .container{
                background-color: #fff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                text-align: center;
                }   
        .otp{
                font-size: 24px;
                font-weight: bold;  
                color: #333;
                margin: 20px 0;
            }
    </style> 
</head>
<body>
    <div class="container">
        <h2>OTP Verification</h2>
        <p>Your OTP code is:</p>
        <div class="otp">${otp}</div>   
        <p>Please use this code to verify your email address.</p>
    </div>
</body>
</html>`
}

