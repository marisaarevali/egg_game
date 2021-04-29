var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    backgroundColor: '#fff',
    width: 1000,
    height: 500,
    /* scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }, */
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var game = new Phaser.Game(config);

function preload() {
    this.load.image('uuesti', 'assets/uuesti.png');
    this.load.image('m2ngl2bi', 'assets/manglabi.png');

    this.load.spritesheet('munaseisab', 'assets/munaseisab.png', { frameWidth: 53, frameHeight: 95 })
    this.load.spritesheet('munajookseb', 'assets/munajookseb3.png', { frameWidth: 90, frameHeight: 95 })
    this.load.spritesheet('munakatki', 'assets/munakatki.png', { frameWidth: 53, frameHeight: 95 })

    this.load.image('maapind', 'assets/maapind4.png');

    this.load.image('takistus1', 'assets/takistus1.png')
    this.load.image('takistus2', 'assets/takistus2.png')
    this.load.image('takistus3', 'assets/takistus3.png')
    this.load.image('takistus4', 'assets/takistus4.png')
    this.load.image('takistus5', 'assets/takistus5.png')
}

const { height, width } = this.game.config;

// Siin deklareerime mängu muutujad
var maapind;
var tegelane;
// klaviatuuri sisendi muutuja
var klaviatuur;
var m2nguKiirus;
var deltaKiirus;
// Boolean muutuja, kui väärtus on false siis mäng seisab
// vajutades tühikut või hiire klikki muutub väärtus true'ks ja mäng läheb käima
m2ngK2ib = false;
//takistuste list
takistusedList = ['takistus1', 'takistus2', 'takistus3', 'takistus4', 'takistus5'];
// nähtamatu takistus
var n2htamatuTakistus;
// Takistuse pildi muutuja
var takistus;
// Takistuste tekke aeg
var synniAeg = 0;



// skoor
skoor = 0;
// Kõrgeimat skoori hpiame brauseri mälus, et peale brauseri uuendamist oleks see alles.
// Kuna localstorage hoiab endas väärtusi sõnena, siis teisendame väärtuse täisarvuks
// Esimesel kasutusel pärib mäng mälust skoori ja saab vastuseks puuduva väärtuse,
// siis asendame selle arvuga 0
if (localStorage.getItem('skoor') == null) {
    maksSkoor = 0;
} else {
    maksSkoor = parseInt(localStorage.getItem('skoor'));
}
// Boolean muutuja mis on false kui mäng käib
// ja muutub true'ks kui vastu takistust minna
kasKaotasid = false;


function create() {
    const { height, width } = this.game.config;

    // Maapind on tilesprite mis automaatselt pikendab ennasy
    // this.add.tileSprite(x-telje asukoht,y-telje asukoht,laius,kõrgus,spraidi nimetus)
    maapind = this.add.tileSprite(0, height, width, 20, 'maapind').setOrigin(0, 1);

    // Kiirus, millega mäng algab
    m2nguKiirus = 10;


    // (x-telje asukoht,y-telje asukoht,kõrgus,spraidi nimetus)
    tegelane = this.physics.add.sprite(0, height, 'munaseisab')
        .setOrigin(0, 1)
        // Lisame mänguväljale piirid peale, et tegelane ei saaks minna mängust välja
        .setCollideWorldBounds(true)
        //teeme ta keha pisemaks, et kokkupõrge oleks täpsem
        .setSize(40,95)
        // Määrame tegelasele gravitatsiooni Y teljel, kukub 5000 px sekundis
        .setGravityY(5000)

    // Jooksmise animatsioon
    this.anims.create({
        key: 'jooksmine',
        frames: this.anims.generateFrameNumbers('munajookseb'),
        frameRate: 9,
        repeat: -1
    });
    //takistuste grupp, kuhu sisse hiljem loome takistused
    takistused = this.add.group();
    //skoor tekst
    skooriKiri = this.add.text(width - 300, 50, 'Skoor: 0', { fill: '#000', font: '700 24px Arial' });
    //Kõrgeim skoor
    maksSkoorKiri = this.add.text(width - 300, 0, 'Kõrgeim skoor: ' + maksSkoor, { fill: '#000', font: '700 24px Arial' });

    //mäng läbi pilt, setAlpha on kõikidel elementidel default 1 mis on nähtav. 0 väärtus on läbipaistev
    m2ngL2bi = this.add.container(width / 2, height / 2).setAlpha(0);
    m2ngL2biTekst = this.add.image(0, 0, 'm2ngl2bi');
    //setInteractive teeb selle pildi klikitavaks
    uuesti = this.add.image(0, 120, 'uuesti').setInteractive();

    m2ngL2bi.add([
        m2ngL2biTekst,
        uuesti
    ])
    //klaviatuuri sisend
    klaviatuur = this.input.keyboard.createCursorKeys();

    // kui tegelane jookseb takistuse pihta siis käivita see funktsioon
    this.physics.add.collider(tegelane, takistused, function kokku() {
        //peata mäng
        m2ngK2ib = false;
        //kas kaotasid?
        kasKaotasid = true;
        //muuda tegelase tekstuuri
        tegelane.setTexture('munakatki');
        //resetime mängukiiruse
        m2nguKiirus = 10;
        //resetime takistuste tekkeaja
        synniAeg = 0;
        //Mäng läbi container nähtavaks
        m2ngL2bi.setAlpha(1);
        if (skoor > maksSkoor) {
            maksSkoor = skoor;
            maksSkoorKiri.setText('Kõrgeim skoor: ' + maksSkoor).setAlpha(1);
        }
        localStorage.setItem('skoor', maksSkoor);
    });

    // Skoori arvutamise ja mängukiiruse suurendamine
    this.time.addEvent({
        delay: 1000 / 10, //10 korda sekundis kutsutakse välja
        loop: true, // kutsu seda funktsiooni välja lõputult
        callbackScope: this,
        //mida teeb funktsioon kui teda välja kutsutakse
        callback: () => {
            // Kas mäng käib?
            if (!m2ngK2ib) { return; } //kui ei siis ära siit edasi mine
            // tõsta skoori 1 võrra, 10 korda sekundis
            skoor++
            // Lisame mängukiirusele 0.01
            m2nguKiirus += 0.01;
            skooriKiri.setText('Skoor: ' + skoor);
        }
    })


    //uuesti nupule vajutuse funktsioon, muudame kõik algsesse olekusse tagasi
    uuesti.on('pointerdown', function uuesti() {
        //kustutab kõik takistused mängust ja grupis - default value on false,false
        takistused.clear(true, true);
        //nuppu vajutades mäng uuesti käima
        m2ngK2ib = true;
        kasKaotasid = false;
        // Varjame jälle mäng läbi konteineri
        m2ngL2bi.setAlpha(0);
        // taastame alge mängukiiruse
        m2nguKiirus = 10;
        skoor = 0;

    })
    //hiireklikk
    hiireKlikk = this.input.activePointer;

}



function update(time, delta) {



    // kui space vajutad, siis tee seda
    if (klaviatuur.space.isDown && m2ngK2ib == false && kasKaotasid == false || hiireKlikk.isDown && m2ngK2ib == false && kasKaotasid == false) {
        //kui tegelane ei ole vastu maad siis ära hüppa
        if (!tegelane.body.onFloor()) { return; }
        tegelane.setVelocityY(-1800);
        console.log(maapind);
        console.log('jeee');
        //järgmise funktsiooni paned ainult siis tööle
        //kui mäng veel ei käi
        // lisame eventi mille käigus hakkab muna jooksma
        //taust hakkab liikuma
        // ja muna asukoht tuleb mängu äärest eemale    
        var startM2ng = this.time.addEvent({
            //delay: 1000/70,
            loop: true,
            callbackScope: this,
            //arrow funktsioon vaja seletada
            callback: () => {
                tegelane.setVelocityX(250);


                if (tegelane.x > 100) {
                    //see paneb update funktsiooni sisu lõpuks käima
                    m2ngK2ib = true;
                    //tegelane ei liigu enam edasi, sest taust liigub
                    tegelane.setVelocity(0);
                    // Paneme tegelase liikuma
                    tegelane.play('jooksmine', 1);
                    startM2ng.remove();
                }

            }
        })
    }

    if (m2ngK2ib == false) { return; }

    // Ühtlase liikumise loomiseks korrutame mängukiiruse deltaga läbi
    deltaKiirus = m2nguKiirus * delta * 0.06;
    //maapinna liikumine
    maapind.tilePositionX += deltaKiirus;
    //suurendame takistuste asukohta mängu jooksul
    Phaser.Actions.IncX(takistused.getChildren(), -deltaKiirus);


    // Kui vajutad tühikut ja tegelane on maas või kui teed hiirekliki ja tegelane on maas
    if (klaviatuur.space.isDown && tegelane.body.onFloor() || hiireKlikk.isDown && tegelane.body.onFloor()) {
        tegelane.setVelocityY(-1800);
    }
    //kui tegelase y väärtus on suurem kui 0, peata liikumise animatsioon ja pane ta paigale (sest ta on õhus)
    if (tegelane.body.deltaAbsY() > 0) {
        tegelane.anims.stop();
        tegelane.setTexture('munaseisab')
    } else {
        tegelane.play('jooksmine', true);
    };

    //paneme takistuste sünniaja jooksma
    synniAeg += delta * m2nguKiirus * 0.08;

    //kui sünniaeg on suurem kui 1500 siis pane takistusefunktsioon tööle
    //ja nulli ära sünniaeg
    if (synniAeg >= 1500) {
        //loome random numbri 0 - 4
        //takistuseNumber = 2;
        takistuseNumber = Math.floor(Math.random() * 5);
        // vahemaa mille vahel takistusi loome
        vahemaa = Phaser.Math.Between(600, 1200);
        //takistuseFunk();
        // loome takistused teele
        // setOrigin sätib kasti tema keskele (0.5,1) y-täitsa all x-keset spraiti
       // takistus = this.physics.add.sprite(width + vahemaa, height, takistusedList[takistuseNumber]).setImmovable().setOrigin(0.5,1).setSize(60,120); //.setOrigin(0, 1) .setSize(60,120,0,0)
        
        //n2htamatuTakistus = this.physics.add.sprite(width + vahemaa + 90, height).setImmovable().setOrigin(0, 1).setSize(120,60,0,0); //.setOffset(20)
        if (takistuseNumber == 0) { //korras
            console.log('jee 000');
            takistus = this.physics.add.sprite(width + vahemaa, height, takistusedList[takistuseNumber]).setImmovable().setOrigin(0.5,1).setSize(50,100);
            }
        if (takistuseNumber == 1) { //korraz
            console.log('jee 1');
            takistus = this.physics.add.sprite(width + vahemaa, height, takistusedList[takistuseNumber]).setImmovable().setOrigin(0.5,1).setSize(70,120); //.setOrigin(0, 1) .setSize(60,120,0,0)
            n2htamatuTakistus = this.physics.add.sprite(width + vahemaa, height).setImmovable().setOrigin(0.5, 1).setSize(130,120); //.setOffset(20)
            takistused.add(n2htamatuTakistus);

        }
        if (takistuseNumber == 2) {
            console.log('jee 2');
            takistus = this.physics.add.sprite(width + vahemaa, height, takistusedList[takistuseNumber]).setImmovable().setOrigin(0.5,1).setSize(60,130,0,0); //.setOrigin(0, 1) .setSize(60,120,0,0)
            n2htamatuTakistus = this.physics.add.sprite(width + vahemaa, height - 20).setImmovable().setOrigin(0.5,1).setSize(120,80); //.setOffset(20)
            takistused.add(n2htamatuTakistus);

        }
        if (takistuseNumber == 3) { //korras
            console.log('jee 3');
            takistus = this.physics.add.sprite(width + vahemaa, height, takistusedList[takistuseNumber]).setImmovable().setOrigin(0.5,1); //.setOrigin(0, 1) .setSize(60,120,0,0)
        }
        
        if (takistuseNumber == 4) { // korras
            console.log('jee 4');
            takistus = this.physics.add.sprite(width + vahemaa, height, takistusedList[takistuseNumber]).setImmovable().setOrigin(0.5,1).setSize(40,110); //.setOrigin(0, 1) .setSize(60,120,0,0)
            n2htamatuTakistus = this.physics.add.sprite(width + vahemaa, height).setImmovable().setOrigin(0.5, 1).setSize(120,65); //.setOffset(20)
            takistused.add(n2htamatuTakistus);

        }
        
        takistused.add(takistus);
        
        console.log(takistuseNumber);
        synniAeg = 0;
    }


}
