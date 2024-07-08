<?php

    // complete the request
    // create an object that will store the data from the user's request
    $data = [];
    
    // get the data from the user's request    
    foreach ( json_decode($_POST['data']) as $key => $value ) {

        if ( is_array($value) ) { // -- if the data is an array...
            
            // encode the array before storing it
            $data[$key] = json_encode($value);
            
        } else {

            // store its name and value
            $data[$key] = $value;   

        }
        
    }

    if ( isset($data['g-recaptcha-response']) ) { // if there's google recaptcha...

            // create the parameters for the google recaptcha request
            $google_recaptcha_parameters = [
                "secret"   => $data['recaptchaSecretKey'],
                "response" => $data['g-recaptcha-response'],
                "remoteip" => $_SERVER['REMOTE_ADDR']
             ];
             
             // make the request
             $google_recaptcha_request = curlSession('https://www.google.com/recaptcha/api/siteverify',$google_recaptcha_parameters);
             
             // if the request was a successs...
             if ( isset($google_recaptcha_request->success) && $google_recaptcha_request->success == 1 ) {
                 
                 // submit the form's data
                 echo json_encode(curlSession($_POST['url'],$data));
                 
             } else { // -- if the request was not a success...
                 
                 // return an error to the user
                 echo json_encode(['result' => 'error', 'error' => 'An error occurred while submitting your request.']);
                 
             }        

    } else { // if there's not google recaptcha...

        // simply submit the form
        echo json_encode(curlSession($_POST['url'], $data));
        
    }

    // performs a php curl session
    function curlSession($url,$data) {
            
        $ch = curl_init(); // intialize the cURL session 
            
        // a curl_setopt_array to set multiple cURL transer options
        curl_setopt_array($ch, [
            CURLOPT_URL            => $url, // the URL of the google apps script that will perform the retrieval
            CURLOPT_POST           => true, // perform a regular HTTP post
            CURLOPT_POSTFIELDS     => $data,
            CURLOPT_RETURNTRANSFER => true, // return transferred data as string
            CURLOPT_FOLLOWLOCATION => true, // redirect the cURL session to retrieve the transferred data
            CURLOPT_COOKIE         => "samesite=Strict"
        ]);	
            
        $output = curl_exec($ch); // execute the cURL session and save the output
            
        curl_close($ch); // close the cURL
            
        return json_decode($output);		    
    }

?>