drop DATABASE IF EXISTS foyerbdd;

create DATABASE foyerbdd;

use foyerbdd;

CREATE TABLE produits (
 
  id_produit	    int(11) 	      NOT NULL AUTO_INCREMENT,
  denomination		varchar(30)	    NOT NULL,
  qt_dispo			  int(11)	        NOT NULL,
  prix	          decimal (3,2)   NOT NULL,
  peremption		  date,
  illustration	  varchar(15),
  	              PRIMARY KEY (id_produit)

) Engine = InnoDB character set utf8 collate utf8_unicode_ci;

INSERT INTO produits  
(denomination,qt_dispo,prix,peremption,illustration) VALUES
('café expresso',90,.40,"2022-11-01","cafe.png"),
('croissant',12,.80,"2021-12-29","croissant.png"),
('coca-cola 33cl',90,.90,"2022-06-01","coca33.png"),
('orangina 33 cl',70,.90,"2022-05-01","orangina33.png"),
('kinder bueno',30,.60,"2022-05-11","kbueno.png"),
('chocolat chaud',88,.50,"2023-01-01","chocolat.png"),
('ice tea',72,.90,"2022-07-01","icetea33.png"),
('snickers',50,.60,"2023-03-01","snickers.png");

CREATE TABLE tables
(
  id_table       int(11) NOT NULL AUTO_INCREMENT,
  numero         int(11) NOT NULL,
  lien_QRcode    varchar(100),
                 PRIMARY KEY (id_table)
) Engine = InnoDB character set utf8 collate utf8_unicode_ci;

INSERT INTO tables(numero) VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12);

CREATE TABLE commandes (

  id_commande      int(11) NOT NULL AUTO_INCREMENT,
  id_table         int(11) NOT NULL,
  email            varchar(50),
  confirmee        boolean NOT NULL,
  preparee         boolean NOT NULL,
  dateCommande     timestamp NOT NULL,
                   PRIMARY KEY (id_commande),
                   FOREIGN KEY (id_table) REFERENCES tables(id_table)
) Engine = InnoDB character set utf8 collate utf8_unicode_ci;

INSERT INTO commandes 
  (id_table, email,confirmee,preparee,dateCommande) VALUES
  (1,"us.er1@profs.institutlemonnier.fr",1,1,20220309000000),
  (5,"us.er1@profs.institutlemonnier.fr",1,0,20220313000001),
  (6,"us.er2@profs.institutlemonnier.fr",1,1,20220312000002),
  (1,"us.er3@profs.institutlemonnier.fr",1,0,20220313000003),
  (7,"us.er4@profs.institutlemonnier.fr",1,0,20220313000004),
  (1,"us.er5@eleves.institutlemonnier.fr",1,0,20220313000005);


CREATE TABLE detail_commandes(
  id_detail     int(11) NOT NULL AUTO_INCREMENT,
  id_commande   int(11) NOT NULL,
  id_produit    int(11) NOT NULL,
  qt_commandee  int(11) NOT NULL,
  cochee        boolean NOT NULL,
                PRIMARY KEY (id_detail),
                FOREIGN KEY (id_commande) REFERENCES commandes(id_commande),
                FOREIGN KEY (id_produit) REFERENCES produits(id_produit)

) Engine = InnoDB character set utf8 collate utf8_unicode_ci;

INSERT INTO detail_commandes
(id_commande, id_produit,qt_commandee,cochee) VALUES
(1,8,1,1),
(2,8,1,0),
(2,1,1,0),
(3,1,1,1),
(4,3,1,0),
(4,2,3,1),
(5,1,1,0),
(5,2,2,1),
(6,3,5,0),
(6,5,3,0),
(6,8,2,1),
(6,7,2,0),
(6,2,2,0);

 
CREATE TABLE users (
 
  id_user			   int(11) 	    NOT NULL AUTO_INCREMENT ,
  _login		     varchar(25)	NOT NULL,
  _password  		 varchar(32)	NOT NULL,
  accessLevel    int(11)      NOT NULL,
 	               PRIMARY KEY (id_user) 
) Engine = InnoDB character set utf8 collate utf8_unicode_ci;

INSERT INTO users  
(_login,_password,accessLevel ) VALUES
('Gestionnaire','D534B96C9C231037A98126891EC898EB',0),
('Barman','EF749FF9A048BAD0DD80807FC49E1C0D',1);

CREATE TABLE pass
(
  id             int(11) NOT NULL AUTO_INCREMENT,
  passcode       char(200) NOT NULL,
                 PRIMARY KEY (id)
) Engine = InnoDB character set utf8 collate utf8_unicode_ci;

INSERT INTO pass
(id, passcode) VALUES
("1", "mnzxhohlhpovmadcdphxkicckwuknyzvybhmzpwlrtxykekrblbkuumrqyevtonlwzxcvaxugftrsaxvhrrulaipnfnolssezinwslztiednualldeqzkyysewwvwqwzylenzfikxtzvlyxmgcggoszkpnanbrlxazedgybicsdtnlqhqhwlfzwdgcwwsglgeywhmkvv");

USE mysql;
DELETE FROM db WHERE User='Barman';

GRANT ALL PRIVILEGES ON foyerbdd.* TO 'prof'@'localhost' IDENTIFIED BY 'Password12345';

FLUSH PRIVILEGES;
