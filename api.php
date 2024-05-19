<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Spécifiez le chemin vers votre base de données SQLite
$dbPath = 'data.db';
$db = new PDO('sqlite:' . $dbPath);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Gère les requêtes CORS pour les tests locaux (à retirer en production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Pour gérer correctement les requêtes OPTIONS envoyées par les navigateurs lors des requêtes CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Route les requêtes en fonction de l'action
$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'fetchAll':
        fetchAll($db);
        break;
    case 'getEntry':
        $id = $_GET['id'] ?? '';
        getEntry($db, $id);
        break;
    case 'delete':
        $id = $_GET['id'] ?? $_POST['id'] ?? '';
        deleteEntry($db, $id);
        break;
    case 'submit':
        submitEntry($db);
        break;
    case 'toggleFavorite':
        $id = $_POST['id'] ?? '';
        toggleFavorite($db, $id);
        break;
    default:
        echo json_encode(['error' => true, 'message' => 'Action non reconnue.']);
        break;
}

/**
 * Récupère toutes les entrées de la base de données
 * @param PDO $db - Instance de la base de données
 */
function fetchAll($db) {
    try {
        $stmt = $db->query('SELECT * FROM entries ORDER BY favori DESC, name ASC');
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (Exception $e) {
        echo json_encode(['error' => true, 'message' => $e->getMessage()]);
    }
}

/**
 * Récupère une entrée spécifique de la base de données
 * @param PDO $db - Instance de la base de données
 * @param int $id - Identifiant de l'entrée à récupérer
 */
function getEntry($db, $id) {
    try {
        $stmt = $db->prepare('SELECT * FROM entries WHERE id = :id');
        $stmt->execute(['id' => $id]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    } catch (Exception $e) {
        echo json_encode(['error' => true, 'message' => $e->getMessage()]);
    }
}

/**
 * Supprime une entrée de la base de données
 * @param PDO $db - Instance de la base de données
 * @param int $id - Identifiant de l'entrée à supprimer
 */
function deleteEntry($db, $id) {
    try {
        $stmt = $db->prepare('DELETE FROM entries WHERE id = :id');
        $success = $stmt->execute(['id' => $id]);
        echo json_encode(['success' => $success]);
    } catch (Exception $e) {
        echo json_encode(['error' => true, 'message' => $e->getMessage()]);
    }
}

/**
 * Soumet une nouvelle entrée ou met à jour une entrée existante
 * @param PDO $db - Instance de la base de données
 */
function submitEntry($db) {
    try {
        $data = $_POST;
        $imagePath = handleImageUpload($_FILES);

        // Si l'image n'est pas téléchargée et qu'une entrée existante est mise à jour, conservez l'image existante
        if (empty($imagePath) && !empty($data['id'])) {
            $stmt = $db->prepare('SELECT imagePath FROM entries WHERE id = :id');
            $stmt->execute(['id' => $data['id']]);
            $existingEntry = $stmt->fetch(PDO::FETCH_ASSOC);
            $imagePath = $existingEntry['imagePath'];
        }

        // Détermine si l'entrée doit être mise à jour ou insérée
        if (!empty($data['id'])) {
            $query = "UPDATE entries SET name = :name, type = :type, status = :status, season = :season, episode = :episode, comment = :comment, rating = :rating, imagePath = :imagePath, favori = :favori WHERE id = :id";
        } else {
            $query = "INSERT INTO entries (name, type, status, season, episode, comment, rating, imagePath, favori) VALUES (:name, :type, :status, :season, :episode, :comment, :rating, :imagePath, :favori)";
        }

        $stmt = $db->prepare($query);
        $params = [
            ':name' => $data['name'],
            ':type' => $data['type'],
            ':status' => $data['status'],
            ':season' => $data['season'] ?? null,
            ':episode' => $data['episode'] ?? null,
            ':comment' => $data['comment'],
            ':rating' => $data['rating'],
            ':imagePath' => $imagePath,
            ':favori' => isset($data['favori']) ? 1 : 0
        ];

        if (!empty($data['id'])) {
            $params[':id'] = $data['id'];
        }

        $success = $stmt->execute($params);
        if (!$success) {
            echo json_encode(['error' => true, 'message' => 'Erreur lors de l\'enregistrement de l\'entrée']);
            return;
        }

        echo json_encode(['success' => $success]);
    } catch (Exception $e) {
        echo json_encode(['error' => true, 'message' => $e->getMessage()]);
    }
}

/**
 * Bascule l'état favori d'une entrée
 * @param PDO $db - Instance de la base de données
 * @param int $id - Identifiant de l'entrée à mettre à jour
 */
function toggleFavorite($db, $id) {
    try {
        $stmt = $db->prepare('UPDATE entries SET favori = 1 - favori WHERE id = :id');
        $stmt->execute(['id' => $id]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['error' => true, 'message' => $e->getMessage()]);
    }
}

/**
 * Gère le téléchargement de l'image
 * @param array $file - Tableau contenant les informations sur le fichier téléchargé
 * @return string - Chemin du fichier téléchargé
 */
function handleImageUpload($file) {
    try {
        if (isset($file['image']) && $file['image']['error'] == UPLOAD_ERR_OK) {
            $targetDir = "images/";
            $fileName = basename(preg_replace("/[^a-zA-Z0-9.]/", "_", $file['image']['name']));
            $targetFilePath = $targetDir . $fileName;

            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0777, true);
            }

            if (move_uploaded_file($file['image']['tmp_name'], $targetFilePath)) {
                return $targetFilePath;
            } else {
                return '';
            }
        }

        return '';
    } catch (Exception $e) {
        echo json_encode(['error' => true, 'message' => $e->getMessage()]);
    }
}
