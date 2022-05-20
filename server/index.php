<?php

require_once "./Route.php";
include "./apiFoyer.php";
include "./mailer.php";
header("Access-Control-Allow-Origin: *");

$user = "paul";
$mdp = "Password123!";
$host = "localhost";
$base = "foyerbdd";
$api = new API_Foyer($base, $user, $mdp, $host);

// ensemble des methodes GET

Route::add(
    "/",
    function () {
        return "Bienvenue sur REST API du groupe6";
    },
    "get"
);

// PRODUITS

Route::add(
    "/getProducts",
    function () {
        global $api;
        $products = $api->getProducts();
        if ($products) {
            http_response_code(200);
            return $products;
        }
        http_response_code(400);
        return json_encode("invalid token");
    },
    "post"
);

Route::add(
    "/getAvailableProducts",
    function () {
        global $api;
        return $api->getAvailableProducts();
    },
    "get"
);

Route::add(
    "/getProductById",
    function () {
        global $api;
        $id = $_GET["id"];
        if ($id) {
            return $api->getProductById($id);
        }
        http_response_code(400);
    },
    "get"
);

Route::add(
    "/getProductsFromCommandId",
    function () {
        global $api;
        $id = $_GET["id"];
        if ($id) {
            return $api->getProductsFromCommandId($id);
        }
        http_response_code(400);
    },
    "get"
);

Route::add(
    "/updateProduct",
    function () {
        global $api;
        if ($api->updateProduct()) {
            http_response_code(200);
            return 1;
        } else {
            http_response_code(400);
            return 0;
        }
    },
    "post"
);

Route::add(
    "/addProduct",
    function () {
        global $api;
        if ($api->addProduct()) {
            http_response_code(200);
            return 1;
        }
        http_response_code(400);
        return 0;
    },
    "post"
);

Route::add(
    "/deleteProduct",
    function () {
        global $api;
        $result = $api->deleteProduct();
        if ($result == -1) {
            http_response_code(400);
            return json_encode("invalid token");
        } else if ($result) {
            http_response_code(200);
            return 1;
        } else {
            http_response_code(400);
            return json_encode("already in command");
        }
    },
    "post"
);

// COMMANDES

Route::add(
    "/getPendingOrders",
    function () {
        global $api;
        return $api->getPendingOrders();
    },
    "get"
);

Route::add(
    "/getCommandById",
    function () {
        global $api;
        $id = $_GET["id"];
        if ($id) {
            return $api->getCommandById($id);
        }
    },
    "get"
);

Route::add(
    "/getAllDetailsCommandForCheckedCommand",
    function () {
        global $api;
        return $api->getAllDetailsCommandForCheckedCommand();
    },
    "post"
);

// DETAIL_COMMANDES

Route::add(
    "/getCommandsDetails",
    function () {
        global $api;
        return $api->getCommandsDetails();
    },
    "get"
);

Route::add(
    "/getCommandDetailByCommandId",
    function () {
        global $api;
        $id = $_GET["id"];
        if ($id) {
            return $api->getCommandDetailByCommandId($id);
        }
        http_response_code(400);
        return 0;
    },
    "get"
);

Route::add(
    "/addCommandDetails",
    function () {
        global $api;

        $datas = $api->addCommand();

        if ($datas[0] == 0) {
            http_response_code(400);
            return 0;
        }

        if (!$api->addCommandDetails($datas[0])) {
            http_response_code(400);
            return 0;
        }

        $token = $api->createCommandToken($datas[0]);

        if (!$token) {
            http_response_code(400);
            return 0;
        }

        sendmail($datas[1], $token);

        return 0;
    },
    "post"
);

Route::add(
    "/checkDetailCommand",
    function () {
        global $api;
        if ($api->checkDetailCommand()) {
            http_response_code(200);
            return 1;
        }
        http_response_code(400);
        return 0;
    },
    "post"
);

Route::add(
    "/prepareCommand",
    function () {
        global $api;
        if ($api->prepareCommand()) {
            http_response_code(200);
            return 1;
        }
        http_response_code(400);
        return 0;
    },
    "post"
);

Route::add(
    "/checkValidationTokenCommand",
    function () {
        global $api;
        $cmdid = $api->decodeCommandToken();
        if (!$cmdid) {
            http_response_code(400);
            return 0;
        }

        http_response_code(200);
        return json_encode($cmdid);
    },
    "post"
);

// TABLES

Route::add(
    "/getTable",
    function () {
        global $api;
        $numero = $_GET["num"];
        if ($numero) {
            $res = $api->getTable($numero);
            if ($res) {
                http_response_code(200);
                return $res;
            }
        }
        http_response_code(400);
    },
    "get"
);

Route::add(
    "/getTables",
    function () {
        global $api;
        $data = json_decode(file_get_contents('php://input'));

        if ($api->isValidPassword("Gestionnaire", $data->token)) {
            http_response_code(200);
            return $api->getTables();
        }
        http_response_code(400);
        return json_encode("invalid token");
    },
    "post"
);

Route::add(
    "/getTables",
    function () {
        global $api;
        return $api->getTables();
    },
    "get"
);

Route::add(
    "/addTable",
    function () {
        global $api;
        if ($api->addTable()) {
            http_response_code(200);
            return 1;
        }
        http_response_code(400);
        return 0;
    },
    "post"
);

Route::add(
    "/updateTable",
    function () {
        global $api;
        $result = $api->updateTable();
        if ($result) {
            http_response_code(200);
            return 1;
        }
        http_response_code(400);
        return null;
    },
    "post"
);

Route::add(
    "/deleteTable",
    function () {
        global $api;
        $result = $api->deleteTable();
        if ($result == -1) {
            http_response_code(400);
            return json_encode("invalid token");
        } else if ($result) {
            http_response_code(200);
            return 1;
        }
        http_response_code(400);
        return json_encode("already in command");
    },
    "post"
);

// USERS

Route::add(
    "/getPass",
    function () {
        global $api;
        return json_encode($api->getPass());
    },
    "get"
);

Route::add(
    "/getUser",
    function () {
        global $api;
        $result = $api->authentificationUser();
        if ($result) {
            return $result;
        }
        return null;
    },
    "post"
);

Route::add(
    "/getUserAccessLevel",
    function () {
        global $api;
        $result = $api->getUserAccessLevel();
        if ($result) {
            return $result;
        }
        return null;
    },
    "post"
);

// gestion des messages d'erreur

Route::pathNotFound(function () {
    return "Ce chemin n'existe pas";
});

Route::methodNotAllowed(function () {
    return "Cette méthode n'existe pas";
});

Route::run("/foyerbdd");