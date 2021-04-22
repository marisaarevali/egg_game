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
            debug: false
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
    this.load.image('manglabi', 'assets/manglabi.png');

    this.load.spritesheet('munaseisab', 'assets/munaseisab.png', { frameWidth: 53, frameHeight: 95 })
    this.load.spritesheet('munajookseb', 'assets/munajookseb3.png', { frameWidth: 90, frameHeight: 95 })
    this.load.spritesheet('munakatki', 'assets/munakatki.png', { frameWidth: 53, frameHeight: 95 })

    this.load.image('maapind', 'assets/maapind3.png');

    this.load.image('takistus1', 'assets/takistus1.png')
    this.load.image('takistus2', 'assets/takistus2.png')
    this.load.image('takistus3', 'assets/takistus3.png')
    this.load.image('takistus4', 'assets/takistus4.png')
    this.load.image('takistus5', 'assets/takistus5.png')
}

const { height, width } = this.game.config;

// Siin all deklareerime mängu muutujad

var maapind;
var tegelane;
// klaviatuuri sisendi muutuja
var cursors;
var manguKiirus;
// Boolean muutuja, kui väärtus on false siis mäng seisab
// vajutades tühikut või hiire klikki muutub väärtus true'ks ja mäng läheb käima
mang = false;
//takistuste list
takistusedList = ['takistus1', 'takistus2', 'takistus3', 'takistus4', 'takistus5'];
// Takistuse pildi muutuja
var takistus;
// Takistuste tekke aeg
var sunniAeg = 0;



// skoor
skoor = 0;
// Highscore hoiame localstorages, et peale brauseri uuendamist oleks see alles.
// Kuna localstorage hoiab endas väärtusi sõnena, siis teisendame väärtuse täisarvuks
// Kuna esimesel kasutusel pärib mäng localstoragest Highskoori ja saab vastuseks puuduva väärtuse,
// siis asendame selle arvuga 0
if (localStorage.getItem('skoor') == null) {
    highSkoor = 0;
} else {
    highSkoor = parseInt(localStorage.getItem('skoor'));
}
// Boolean muutuja mis on false kui mäng käib
// ja muutub true'ks kui vastu takistust minna
gameOver = false;


function create() {
    const { height, width } = this.game.config;

    // Maapind on tilesprite mis automaatselt pikendab ennasy
    // this.add.tileSprite(x-telje asukoht,y-telje asukoht,laius,kõrgus,spraidi nimetus)
    maapind = this.add.tileSprite(0, height, width, 20, 'maapind').setOrigin(0, 1);

    // Kiirus, millega mäng algab
    manguKiirus = 10;


    // (x-telje asukoht,y-telje asukoht,kõrgus,spraidi nimetus)
    tegelane = this.physics.add.sprite(0, height, 'munaseisab')
        .setOrigin(0, 1)
        // Lisame mänguväljale piirid peale, et tegelane ei saaks minna mängust välja
        .setCollideWorldBounds(true)
        // Määrame tegelasele gravitatsiooni Y teljel, kukub 5000 px sekundis
        .setGravityY(5000)

    // Jooksmise animatsioon
    this.anims.create({
        key: 'jooksmine',
        frames: this.anims.generateFrameNumbers('munajookseb'),
        frameRate: 9,
        repeat: -1
    });
    //takistuste grupi loome kohe ära, et ei oleks errorit
    takistused = this.add.group();
    //skoor tekst
    skooriKiri = this.add.text(width - 300, 50, 'Skoor: 0', { fill: '#000', font: '700 24px Arial' });
    //highcsore 
    highSkooriKiri = this.add.text(width - 300, 0, 'Kõrgeim skoor: ' + highSkoor, { fill: '#000', font: '700 24px Arial' });

    //mang labi pilt, setAlpha on kõikidel elementidel default 1 mis on nähtav. 0 väärtus on läbipaistev
    mangLabi = this.add.container(width / 2, height / 2).setAlpha(0);
    mangLabiTekst = this.add.image(0, 0, 'manglabi');
    //setInteractive teeb selle pildi klikitavaks
    uuesti = this.add.image(0, 120, 'uuesti').setInteractive();

    mangLabi.add([
        mangLabiTekst,
        uuesti
    ])
    //klaviatuuri sisend
    cursors = this.input.keyboard.createCursorKeys();

    // kui tegelane jookseb takistuse pihta siis käivita see funktsioon
    this.physics.add.collider(tegelane, takistused, function kokku() {
        //peata mäng
        mang = false;
        //mängläbi ?
        gameOver = true;
        //muuda tegelase tekstuuri
        tegelane.setTexture('munakatki');
        //resetime mängukiiruse
        manguKiirus = 10;
        //resetime takistuste tekkeaja
        sunniAeg = 0;
        //manglabi container nähtavaks
        mangLabi.setAlpha(1);
    });

    // Skoori arvutamise ja mängukiiruse suurendamine
    this.time.addEvent({
        delay: 1000 / 10, //10 korda sekudis kutsutakse välja
        loop: true, // kutsu seda funktsiooni välja lõputult
        callbackScope: this,
        //mida teeb funktsioon kui teda välja kutsutakse
        callback: () => {
            // Ka mäng käib?
            if (!mang) { return; } //kui ei siis ära siit edasi mine
            // tõsta skoori 1 võrra, 10 korda sekundis
            skoor++
            // Lisame mängukiirusele 0.01
            manguKiirus += 0.01;
            skooriKiri.setText('Skoor: ' + skoor);
        }
    })


    //uuesti nupule vajutuse funktsioon, muudame kõik algsesse olekusse tagasi
    uuesti.on('pointerdown', function uuesti() {
        //kustutab kõik takistused mängust ja grupis - default value on false,false
        takistused.clear(true, true);
        //nuppu vajutades mäng uuesti käima
        mang = true;
        gameOver = false;
        // Varjame jälle mäng läbi konteineri
        mangLabi.setAlpha(0);
        // taastame alge mängukiiruse
        manguKiirus = 10;
        //vajadusel uuendame highscore
        if (skoor > highSkoor) {
            highSkoor = skoor;
            highSkooriKiri.setText('Kõrgeim skoor: ' + highSkoor).setAlpha(1);

        }

        // paneme highskoori local datasse
        localStorage.setItem('skoor', highSkoor);
        //resetime skoori
        skoor = 0;

    })
    // 
    pointer = this.input.activePointer;

/*     this.input.on('pointerdown', function(){
        tegelane.setVelocityY(-1800);
    }, this);
 */
}



function update(time, delta) {

    // kui space vajutad, siis tee seda
    if (cursors.space.isDown && mang == false && gameOver == false || pointer.isDown && mang == false && gameOver == false) {
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
        var startMang = this.time.addEvent({
            //delay: 1000/70,
            loop: true,
            callbackScope: this,
            //arrow funktsioon vaja seletada
            callback: () => {
                tegelane.setVelocityX(250);


                if (tegelane.x > 100) {
                    //see paneb update funktsiooni sisu lõpuks käima
                    mang = true;
                    //tegelane ei liigu enam edasi, sest taust liigub
                    tegelane.setVelocity(0);
                    // Paneme tegelase liikuma
                    tegelane.play('jooksmine', 1);
                    startMang.remove();
                }

            }
        })
    }

    if (mang == false) { return; }
    maapind.tilePositionX += manguKiirus;

    //suurendame takistuste asukohta mangujooksul
    Phaser.Actions.IncX(takistused.getChildren(), -manguKiirus);

    // Kui vajutad tühikut ja tegelane on maas // kui teed hiirekliki ja tegelane on maas
    if (cursors.space.isDown && tegelane.body.onFloor() || pointer.isDown && tegelane.body.onFloor()) {
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
    sunniAeg += delta * manguKiirus * 0.08;

    //kui sünniaeg on suurem kui 1500 siis pane takistusefunktsioon tööle
    //ja nulli ära sünniaeg
    if (sunniAeg >= 1500) {
        //loome random numbri 0 - 4
        var takistuseNumber = Math.floor(Math.random() * 5);
        // vahemaa mille vahel takistusi loome
        var vahemaa = Phaser.Math.Between(600, 1200);
        //takistuseFunk();
        // loome takistused teele
        takistus = this.physics.add.sprite(width + vahemaa, height, takistusedList[takistuseNumber]).setOrigin(0, 1).setImmovable();
        takistused.add(takistus);
        console.log(takistuseNumber);
        sunniAeg = 0;
    }


}
