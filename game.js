var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    backgroundColor: '#fff',
    width: 1000,
    height: 500,
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

function preload ()
{
    this.load.image('uuesti', 'assets/uuesti.png');
    this.load.image('manglabi', 'assets/manglabi.png');

    this.load.spritesheet('munaseisab', 'assets/munaseisab.png', { frameWidth: 53, frameHeight: 95 })
    this.load.spritesheet('munajookseb', 'assets/munajookseb.png', { frameWidth: 90, frameHeight: 95 })
    this.load.spritesheet('munakatki', 'assets/munakatki.png', { frameWidth: 53, frameHeight: 95 })

    this.load.image('maapind', 'assets/maapind3.png');

    this.load.image('takistus1', 'assets/takistus1.png')
    this.load.image('takistus2', 'assets/takistus2.png')
    this.load.image('takistus3', 'assets/takistus3.png')
    this.load.image('takistus4', 'assets/takistus4.png')
    this.load.image('takistus5', 'assets/takistus5.png')
}

const {height,width} = this.game.config;
//takistus
var takistus;
//maapind
var maapind;
//tegelane kellega mängime
var tegelane;
// klaviatuuri inputi muutuja
var cursors;
//kui kiiresti mäng käib
var manguKiirus;
// boolean muutuja mäng, kui see on true siis läheb mäng käima
mang = false;
//takistuste tekke aeg
var sunniAeg = 0;
//takistused mängus
var takistused;
//takistuste list
takistusedList = ['takistus1','takistus2','takistus3','takistus4','takistus5'];
// skoor
skoor = 0;
//highscore hoiame localstorages, et peale refreshi säiliks skoor
//kuna localstorage hoiab endas stringina väärtusi, siis muudame intiks juba siin
highSkoor = parseInt(localStorage.getItem('skoor'));
//var tyhik;
var cursors;
// kas kaotasid ???
gameOver = false;


function create ()
{   
    const {height,width} = this.game.config;
    //maapind on tilesprite mis pikeneb edasi
    maapind = this.add.tileSprite(0,height,width,20,'maapind').setOrigin(0,1);
    //mängukiirus, millega mäng algab
    manguKiirus = 10;
    //mängu tegelane
    tegelane = this.physics.add.sprite(0,height-50,'munaseisab')
      .setOrigin(0,1)
      //paneme mängule piirid peale, et tegelane ei saaks minna mängust välja
      .setCollideWorldBounds(true)
      //lisame gravitatsiooni Y teljel, kukub 5000 px sekundis
      .setGravityY(5000)
    //jooksu animatsioon
    this.anims.create( {
        key: 'jooksmine',
        frames: this.anims.generateFrameNumbers('munajookseb'),
        //10fps
        frameRate: 7,
        //repeat: -1
    });
    //takistuste grupi loome kohe ära, et ei oleks errorit
    takistused = this.add.group();
    //skoor tekst
    skooriKiri = this.add.text(width-875,0,'Skoor: 0',{fill: '#000', font: '700 24px Arial', resolution: 5}).setOrigin(1,0);
    //highcsore 
    highSkooriKiri = this.add.text(width-750,50,'Kõrgeim skoor: ' + highSkoor,{fill: '#000', font: '700 24px Arial', resolution: 5})
      .setOrigin(1,0)
      .setAlpha(1); // esialgu nähtamatu kui veel mänginud ei ole

    //mang labi pilt, setAlpha on kõikidel elementidel default 1 mis on nähtav. 0 väärtus on läbipaistev
    mangLabi = this.add.container(width/2, height/2).setAlpha(0);
    mangLabiTekst = this.add.image(0,0,'manglabi');
    //setInteractive teeb selle pildi klikitavaks
    uuesti = this.add.image(0,120, 'uuesti').setInteractive();

    mangLabi.add([
      mangLabiTekst,
      uuesti
    ])
    //klaviatuuri input
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

// skoori arvutamine ja mängukiiruse kiirendamine
    this.time.addEvent({
        delay: 1000/10, //10 korda sekudis kutsutakse välja
        loop: true,
        callbackScope: this,
        //mida teeb funktsioon kui teda välja kutsutakse
        callback: () => {
          //kas mäng käib?
          if (!mang ) { return;} //kui ei siis return
          // mäng käib tõsta skoori 1 võrra
          skoor++
          // teeme mängu kiiremaks
          manguKiirus += 0.01;
          //console.log('skoor ' + skoor);
          //console.log('kiirus '+ manguKiirus);
          skooriKiri.setText('Skoor: ' + skoor);
        }
    })


    //uuesti nupule vajutuse funktsioon, muudame kõik algsesse olekusse tagasi
    uuesti.on('pointerdown', function uuesti() {
         // tegelane tagasi 0 punkti
         tegelane.setVelocityY(0);
         tegelane.body.height = 95;
         tegelane.body.offset.y = 0;
         
         //kustutab kõik takistused mängust ja grupis - default value on false,false
         takistused.clear(true,true);
         //nuppu vajutades mäng uuesti käima
         mang = true;
         gameOver = false;
         //varjame jälle lõpuekraani
         mangLabi.setAlpha(0);
         //taasta kõik pausile pandud animatsioonid
         //anims.resumeAll();
         //resetime mangukiiruse
         manguKiirus = 10;
         //vajadusel uuendame highscore
         if (skoor > highSkoor){
           highSkoor = skoor;
           highSkooriKiri.setText('Kõrgeim skoor: ' + highSkoor).setAlpha(1);
           
         }

         // paneme highskoori local datasse
         localStorage.setItem('skoor', highSkoor);
         //resetime skoori
         skoor = 0;
   
       })


       pointer = this.input.activePointer;


    
       

}



function update (time, delta)
{   

// kui space vajutad, siis tee seda
     if (cursors.space.isDown && mang == false && gameOver == false || pointer.isDown && mang == false && gameOver == false)
     {
         //kui tegelane ei ole vastu maad siis ära hüppa
         if (!tegelane.body.onFloor()) { return;}
         tegelane.setVelocityY(-1800);
         console.log(maapind);
         console.log('jeee');
         //järgmise funktsiooni paned ainult siis tööle
         //kui mäng veel ei käi
         // lisame eventi mille käigus hakkab muna jooksma
         //taust hakkab liikuma
         // ja muna asukoht tuleb mängu äärest eemale    
         const startMang = this.time.addEvent({
             delay: 1000/60,
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
                 tegelane.play('jooksmine', 1);
                 startMang.remove();
               }
      
             }
           })
        

     }

    if (mang == false) { return ; }
    maapind.tilePositionX += manguKiirus;

    //suurendame takistuste asukohta mangujooksul
    Phaser.Actions.IncX(takistused.getChildren(), -manguKiirus);
    


    if (cursors.space.isDown && tegelane.body.onFloor() || pointer.isDown && tegelane.body.onFloor()) {
        tegelane.setVelocityY(-1800);
        if (tegelane.body.deltaAbsY() > 0) {
            tegelane.anims.stop();
            tegelane.setTexture('munaseisab')
          // ja kui ta on vastu maad ehk jookseb
          } else {
            //kasutame ternary operatorit - tingimus ? väljund mida teha kui tingimus on true : väljund mida teha kui tingimus on false
            // Kui tegelase keha on lyhem kui 58px? pane kükitav animatsioon : kui ei siis pane tavaline anim
            tegelane.play('jooksmine', true);
      
          }
    }

    //kui tegelase y väärtus on suurem kui 0, peata liikumise animatsioon ja pane ta paigale (sest ta on õhus)
    if (tegelane.body.deltaAbsY() > 0) {
        tegelane.anims.stop();
        
        tegelane.setTexture('munaseisab')
        
    } else {
        //kasutame ternary operatorit - tingimus ? väljund mida teha kui tingimus on true : väljund mida teha kui tingimus on false
        // Kui tegelase keha on lyhem kui 58px? pane kükitav animatsioon : kui ei siis pane tavaline anim
        tegelane.play('jooksmine', true);
    };

    //paneme takistuste sünniaja jooksma
    sunniAeg += delta * manguKiirus * 0.08;
    
    //kui sünniaeg on suurem kui 1500 siis pane takistusefunktsioon tööle
    //ja nulli ära sünniaeg
    if (sunniAeg >= 1500) {
        //loome random numbri 0 - 4
        var takistuseNumber =  Math.floor(Math.random() * 5);
        // vahemaa mille vahel takistusi loome
        var vahemaa = Phaser.Math.Between(600,1200);
        //takistuseFunk();
        // loome takistused teele
        takistus = this.physics.add.sprite(width+vahemaa,height,takistusedList[takistuseNumber]).setOrigin(0,1).setImmovable();
        takistused.add(takistus);
        console.log(takistuseNumber);
        sunniAeg = 0;
    }

   /*  resources = 0;
    timer = 1000;

    
    timer += delta;
    while (timer > 1000) {
        resources += 1;
        timer -= 1000;
    }


    skoor += resources;
    manguKiirus += 0.01;
    console.log('skoor ' + skoor);
    console.log('kiirus '+ manguKiirus);
    skooriKiri.setText('Skoor: ' + skoor); */

  
  


   
   


    

    /* player.setVelocity(0);

    if (cursors.space.isDown)
    {
        mang = true;
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(300);
    }

    if (cursors.up.isDown)
    {
        player.setVelocityY(-300);
    }
    else if (cursors.down.isDown)
    {
        player.setVelocityY(300);
    } */
}
