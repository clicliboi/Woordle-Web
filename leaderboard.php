<?php
$servername = "mysql.hostinger.nl";  
$username = "u616361588_woordle";
$password = "Woordle123";
$dbname = "u616361588_woordle"; 

// Voeg deze regels toe om CORS toe te staan
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// GET request om de leaderboard op te halen
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT name, score FROM scores ORDER BY score DESC LIMIT 10");
    $leaderboard = [];

    while ($row = $result->fetch_assoc()) {
        $leaderboard[] = $row;
    }

    echo json_encode($leaderboard);
    exit; // Stop de uitvoering hier na het verzenden van de gegevens
}

// POST request om score op te slaan
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['name']) && isset($_POST['score'])) {
        $name = $_POST['name'];
        $score = $_POST['score'];

        $stmt = $conn->prepare("INSERT INTO scores (name, score) VALUES (?, ?)");
        $stmt->bind_param("si", $name, $score);
        
        if ($stmt->execute()) {
            echo "Score opgeslagen!";
        } else {
            echo "Fout bij het opslaan van de score!";
        }
    } else {
        echo "Geen geldige gegevens ontvangen.";
    }
}

$conn->close();
?>
