/*
Riven
load dependency
"koi": "file:../pxt-koi"
*/

//% color="#5c7cfa" weight=10 icon="\u03f0"
//% groups='["Basic", "Graphic", Classifier", "Tag/Code", "Audio", "Face", "Wifi", "CloudAI"]'
namespace koi {
  type EvtAct = () => void
  type EvtNum = (num: number) => void
  type Evtxy = (x: number, y: number) => void
  type Evtxywh = (x: number, y: number, w: number, h: number) => void
  type Evtxyr = (x: number, y: number, r: number) => void
  type Evtpp = (x1: number, y1: number, x2: number, y2: number) => void
  type Evttxt = (txt: string) => void
  type Evtsxy = (
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    rX: number,
    rY: number,
    rZ: number
  ) => void
  type Evtss = (t1: string, t2: string) => void
  type Evtsn = (t1: string, n: number) => void
  type Evtssnns = (t1: string, t2: string, n: number, n1: number, t3: string) => void

  let classifierEvt: Evttxt = null
  let kmodelEvt: EvtNum = null
  let speechCmdEvt: Evttxt = null
  let facetokenEvt: Evtssnns = null
  let facefoundEvt: Evtsn = null

  let btnEvt: Evtxy = null
  let circleEvt: Evtxyr = null
  let rectEvt: Evtxywh = null
  let colorblobEvt: Evtxywh = null
  let lineEvt: Evtpp = null
  let imgtrackEvt: Evtxywh = null
  let qrcodeEvt: Evttxt = null
  let barcodeEvt: Evttxt = null
  let apriltagEvt: Evtsxy = null
  let facedetEvt: Evtxy = null
  let ipEvt: Evttxt = null
  let mqttDataEvt: Evtss = null

  let lastCmd: Array<string> = null
  let faceNum = 0


  const PortSerial = [
    [SerialPin.P0, SerialPin.P8],
    [SerialPin.P1, SerialPin.P12],
    [SerialPin.P2, SerialPin.P13],
    [SerialPin.P14, SerialPin.P15],
  ]

  export enum SerialPorts {
    PORT1 = 0,
    PORT2 = 1,
    PORT3 = 2,
    PORT4 = 3,
  }

  export enum LcdDirection {
    //% block=Front
    Front = 0,
    //% block=Back
    Back = 2,
  }

  function trim(n: string): string {
    while (n.charCodeAt(n.length - 1) < 0x1f) {
      n = n.slice(0, n.length - 1)
    }
    return n
  }

  serial.onDataReceived('\n', function () {
    let a = serial.readUntil('\n')
    if (a.charAt(0) == 'K') {
      a = trim(a)
      let b = a.slice(1, a.length).split(' ')
      let cmd = parseInt(b[0])
      if (cmd == 42) {
        if (classifierEvt) {
          classifierEvt(b[1])
        }
      } else if (cmd == 46) {
        if (kmodelEvt) {
          kmodelEvt(parseInt(b[1]))
        }
      } else if (cmd == 3) {
        if (btnEvt) {
          btnEvt(parseInt(b[1]), parseInt(b[2])) // btna btnb
        }
      } else if (cmd == 10) {
        // circle position
        if (circleEvt) {
          circleEvt(parseInt(b[1]), parseInt(b[2]), parseInt(b[3])) // x y r
        }
      } else if (cmd == 11) {
        // rect return
        if (rectEvt) {
          rectEvt(
            parseInt(b[1]),
            parseInt(b[2]),
            parseInt(b[3]),
            parseInt(b[4])
          ) // x y w h
        }
      } else if (cmd == 12) {
        // line track
        if (lineEvt) {
          lineEvt(
            parseInt(b[1]),
            parseInt(b[2]),
            parseInt(b[3]),
            parseInt(b[4])
          )
        }
      } else if (cmd == 15) {
        // color blob
        if (colorblobEvt) {
          colorblobEvt(
            parseInt(b[1]),
            parseInt(b[2]),
            parseInt(b[3]),
            parseInt(b[4])
          )
        }
      } else if (cmd == 17) {
        // image track return
        if (imgtrackEvt) {
          imgtrackEvt(
            parseInt(b[1]),
            parseInt(b[2]),
            parseInt(b[3]),
            parseInt(b[4])
          )
        }
      } else if (cmd == 20) {
        // qrcode return
        if (qrcodeEvt) {
          qrcodeEvt(b[1])
        }
      } else if (cmd == 22) {
        // barcode return
        if (barcodeEvt) {
          barcodeEvt(b[1])
        }
      } else if (cmd == 23) {
        // april tag return
        if (apriltagEvt) {
          apriltagEvt(
            b[1],
            parseInt(b[2]),
            parseInt(b[3]),
            parseInt(b[4]),
            parseInt(b[5]),
            Math.roundWithPrecision(parseFloat(b[6]), 2),
            Math.roundWithPrecision(parseFloat(b[7]), 2),
            Math.roundWithPrecision(parseFloat(b[8]), 2)
          )
        }
      } else if (cmd == 31) {
        // face position
        if (facedetEvt && b[1]) {
          facedetEvt(parseInt(b[1]), parseInt(b[2]))
        }
      } else if (cmd == 32) {
        // face number
        faceNum = parseInt(b[1])
      } else if (cmd == 54) {
        // ip
        if (ipEvt) {
          ipEvt(b[1])
        }
      } else if (cmd == 55) {
        if (mqttDataEvt) {
          mqttDataEvt(b[1], b[2])
        }
      } else if (cmd == 65) {
        if (speechCmdEvt) {
          speechCmdEvt(b[1])
        }
      } else if (cmd == 75) {
        if (facetokenEvt) {
          // K75 token age gender ismask expression
          facetokenEvt(b[1], b[3], parseInt(b[2]), parseInt(b[4]), b[5])
        }
      } else if (cmd == 77) {
        if (facefoundEvt) {
          facefoundEvt(b[1], parseInt(b[2]))
        }
      } else {
        lastCmd = b.slice(1); // deep copy?
      }
      control.raiseEvent(EventBusSource.MES_BROADCAST_GENERAL_ID, 0x8900+cmd)
    }
  })

  function asyncWrite(msg: string, evt: number): void {
    serial.writeLine(msg)
    control.waitForEvent(EventBusSource.MES_BROADCAST_GENERAL_ID, 0x8900 + evt)

  }

  /**
   * init serial port
   * @param tx Tx pin; eg: SerialPin.P1
   * @param rx Rx pin; eg: SerialPin.P2
   */
  //% blockId=koi_init block="KOI init|Tx pin %tx|Rx pin %rx"
  //% group="Basic" weight=100
  export function koi_init(tx: SerialPin, rx: SerialPin): void {
    serial.redirect(tx, rx, BaudRate.BaudRate115200)
    basic.pause(100)
    serial.setTxBufferSize(64)
    serial.setRxBufferSize(64)
    serial.readString()
    serial.writeString('\n\n')
    // take control of the ext serial port from KOI
    asyncWrite(`K0`, 0)
    basic.pause(300)
  }

  //% blockId=koi_init_pw block="KOI init powerbrick|Port %port"
  //% group="Basic" weight=99
  export function koi_init_pw(port: SerialPorts): void {
    koi_init(PortSerial[port][0], PortSerial[port][1])
  }

  //% blockId=koi_lcd_direction block="KOI LCD Dir%dir"
  //% group="Basic" weight=98
  export function koi_lcd_direction(dir: LcdDirection): void {
    let str = `K6 ${dir}`
    serial.writeLine(str)
    basic.pause(100)
  }

  /**
   * @param t string to display; eg: hello
   * @param d delay; eg: 1000
   */
  //% blockId=koi_print block="KOI print %t X %x Y %y||delay %d ms"
  //% x.min=0 x.max=240
  //% y.min=0 y.max=240
  //% group="Basic" weight=97
  export function koi_print(t: string, x: number,y: number, d:number=1000): void {
    let str = `K4 ${x} ${y} ${d} ${t}`
    serial.writeLine(str)
  }

  //% blockId=koi_onbtn block="on Button"
  //% weight=96
  //% group="Basic" draggableParameters=reporter
  export function koi_onbtn(
    handler: (btnA: number, btnB: number) => void
  ): void {
    btnEvt = handler
  }

  /**
   * @param name savepath; eg: name.jpg
   */
  //% blockId=koi_screenshot block="KOI Screenshot %name"
  //% group="Basic" weight=95
  export function koi_screenshot(name: string): void {
    let str = `K2 ${name}`
    serial.writeLine(str)
  }

  /**
   * @param name jpeg to display; eg: name.jpg
   */
  //% blockId=koi_display block="KOI Display %name"
  //% group="Basic" weight=94 blockGap=40
  export function koi_display(name: string): void {
    let str = `K1 ${name}`
    serial.writeLine(str)
  }

  //% blockId=koi_reset_cls block="KOI Reset Classifier"
  //% group="Classifier" weight=90
  export function koi_reset_cls(): void {
    let str = `K40`
    serial.writeLine(str)
  }

  /**
   * @param tag tag index; eg: cat
   */
  //% blockId=koi_addtag block="KOI Add Tag %tag"
  //% group="Classifier" weight=89
  export function koi_addtag(tag: string): void {
    let str = `K41 ${tag}`
    serial.writeLine(str)
  }

  //% blockId=koi_run block="KOI Run Classifer"
  //% group="Classifier" weight=88
  export function koi_run(): void {
    let str = `K42`
    serial.writeLine(str)
    // asyncWrite(str, 42)
  }

  //% blockId=koi_classified block="on Identified"
  //% group="Classifier" weight=87 draggableParameters=reporter
  export function koi_classified(handler: (classId: string) => void) {
    classifierEvt = handler
  }

  /**
   * @param path json to save; eg: class.json
   */
  //% blockId=koi_cls_save block="KOI Save Classifier %path"
  //% group="Classifier" weight=86
  export function koi_cls_save(path: string): void {
    let str = `K43 ${path}`
    serial.writeLine(str)
  }

  /**
   * @param path json to save; eg: class.json
   */
  //% blockId=koi_cls_load block="KOI Load Classifier %path"
  //% group="Classifier" weight=85
  export function koi_cls_load(path: string): void {
    let str = `K44 ${path}`
    serial.writeLine(str)
  }


  /**
   * @param th threshold; eg: 2000
   */
  //% blockId=koi_track_circle block="KOI track circle threshold%th"
  //% group="Graphic" weight=80
  export function koi_track_circle(th: number): void {
    let str = `K10 ${th}`
    serial.writeLine(str)

  }

  //% blockId=koi_oncircletrack block="on Find Circle"
  //% group="Graphic" weight=79 draggableParameters=reporter blockGap=40
  export function koi_oncircletrack(
    handler: (x: number, y: number, r: number) => void
  ) {
    circleEvt = handler
  }

  /**
   * @param th threshold; eg: 6000
   */
  //% blockId=koi_track_rect block="KOI track rectangle %th"
  //% group="Graphic" weight=78
  export function koi_track_rect(th: number): void {
    let str = `K11 ${th}`
    serial.writeLine(str)
  }

  //% blockId=koi_onrecttrack block="on Find Rectangle"
  //% group="Graphic" weight=77 draggableParameters=reporter blockGap=40
  export function koi_onrecttrack(
    handler: (x: number, y: number, w: number, h: number) => void
  ) {
    rectEvt = handler
  }

  /**
   * @param key color key; eg: red
   */
  //% blockId=koi_colorcali block="KOI color calibration %key"
  //% group="Graphic" weight=76
  export function koi_colorcali(key: string) {
    let str = `K16 ${key}`
    serial.writeLine(str)
  }

  /**
   * @param key color key; eg: red
   */
  //% blockId=koi_track_line block="KOI track line %key"
  //% group="Graphic" weight=75
  export function koi_track_line(key: string): void {
    let str = `K12 ${key}`
    serial.writeLine(str)
  }

  //% blockId=koi_onlinetrack block="on Line Update"
  //% group="Graphic" weight=74 draggableParameters=reporter
  export function koi_onlinetrack(
    handler: (x1: number, y1: number, x2: number, y2: number) => void
  ) {
    lineEvt = handler
  }

  /**
   * @param key color key; eg: red
   */
  //% blockId=koi_track_colorblob block="KOI track color blob %key"
  //% group="Graphic" weight=73
  export function koi_track_colorblob(key: string): void {
    let str = `K15 ${key}`
    serial.writeLine(str)
  }

  //% blockId=koi_oncolorblob block="on Color blob"
  //% group="Graphic" weight=72 draggableParameters=reporter blockGap=40
  export function koi_oncolorblob(
    handler: (x: number, y: number, w: number, h: number) => void
  ) {
    colorblobEvt = handler
  }

  //% blockId=koi_qrcode block="KOI QR code"
  //% group="Tag/Code" weight=70
  export function koi_qrcode() {
    let str = `K20`
    serial.writeLine(str)
  }

  //% blockId=koi_onqrcode block="on QR code"
  //% group="Tag/Code" weight=69 draggableParameters=reporter blockGap=40
  export function koi_onqrcode(handler: (link: string) => void) {
    qrcodeEvt = handler
  }

  //% blockId=koi_barcode block="KOI BAR code"
  //% group="Tag/Code" weight=68
  export function koi_barcode() {
    let str = `K22`
    serial.writeLine(str)
  }

  //% blockId=koi_onbarcode block="on Barcode code"
  //% group="Tag/Code" weight=67 draggableParameters=reporter blockGap=40
  export function koi_onbarcode(handler: (code: string) => void) {
    barcodeEvt = handler
  }

  //% blockId=koi_apriltag block="KOI April Tag"
  //% group="Tag/Code" weight=66
  export function koi_apriltag() {
    let str = `K23`
    serial.writeLine(str)
  }

  //% blockId=koi_onapriltag block="on AprilTag"
  //% group="Tag/Code" weight=65 draggableParameters=reporter blockGap=40
  export function koi_onapriltag(
    handler: (
      id: string,
      x: number,
      y: number,
      w: number,
      h: number,
      tX: number,
      tY: number,
      tZ: number
    ) => void
  ) {
    apriltagEvt = handler
  }

  //% blockId=koi_loadyoloface block="KOI Load Face yolo"
  //% group="Face" weight=60
  export function koi_loadyoloface() {
    let str = `K30`
    serial.writeLine(str)
  }

  //% blockId=koi_facedetect block="KOI face detect"
  //% group="Face" weight=59
  export function koi_facedetect() {
    let str = `K31`
    // serial.writeLine(str)
    // basic.pause(200)
    asyncWrite(str, 31)
  }

  //% blockId=koi_facecount block="KOI face number"
  //% group="Face" weight=57 blockGap=40
  export function koi_facecount(): number {
    let str = `K32`
    asyncWrite(`K32`, 32)
    return faceNum
  }

  //% blockId=koi_onfindface block="on Find Face"
  //% group="Face" weight=58 draggableParameters=reporter blockGap=40
  export function koi_onfindface(handler: (x: number, y: number) => void) {
    facedetEvt = handler
  }
  
  /**
   * @param ssid SSID; eg: ssid
   * @param pass PASSWORD; eg: password
   */
  //% blockId=koi_join_ap block="Join Ap %ssid %pass"
  //% group="Wifi" weight=50
  export function koi_join_ap(ssid: string, pass: string) {
    serial.writeLine(`K50 ${ssid} ${pass}`)
  }

  //% blockId=koi_getip block="Wifi Get IP"
  //% group="Wifi" weight=49
  export function koi_get_ip() {
    // serial.writeLine(`K54`)
    let str = `K54`
    asyncWrite(str, 54)
  }

  //% blockId=koi_ip_onread block="on IP Data"
  //% group="Wifi" weight=48 draggableParameters=reporter
  export function koi_ip_onread(
    handler: (ip: string) => void
  ) {
    ipEvt = handler
  }  

  //% blockId=koi_gettime block="KOI get time"
  //% group="Wifi" weight=47
  export function koi_gettime(): Array<string> {
    asyncWrite(`K56`, 56)
    return lastCmd
  }

  /**
   * @param host Mqtt host; eg: iot.kittenbot.cn
   * @param cid Client ID; eg: clientid
   * @param port Host Port; eg: 1883
   * @param user Username; eg: user
   * @param pass Password; eg: pass
   */
  //% blockId=koi_mqtt_host block="Mqtt Host %host| clientID%cid||Port%port User%user Pass%pass"
  //% group="Wifi" weight=46
  export function koi_mqtt_host(
    host: string,
    cid: string,
    port: number = 1883,
    user: string = null,
    pass: string = null
  ) {
    if (user && pass) {
      serial.writeLine(`K51 ${host} ${cid} ${port} ${user} ${pass}`)
    } else {
      serial.writeLine(`K51 ${host} ${cid} ${port}`)
    }
  }

  /**
   * @param topic Topic to subscribe; eg: /topic
   */
  //% blockId=koi_mqtt_sub block="Mqtt Subscribe %topic"
  //% group="Wifi" weight=45
  export function koi_mqtt_sub(topic: string) {
    serial.writeLine(`K52 ${topic}`)
  }

  /**
   * @param topic Topic to publish; eg: /topic
   * @param data Data to publish; eg: hello
   */
  //% blockId=koi_mqtt_pub block="Mqtt Publish %topic %data"
  //% group="Wifi" weight=44
  export function koi_mqtt_pub(topic: string, data: string) {
    serial.writeLine(`K53 ${topic} ${data}`)
  }

  /**
   * @param topic Mqtt Read; eg: /topic
   */
  //% blockId=koi_mqtt_read block="Mqtt Read %topic"
  //% group="Wifi" weight=43
  export function koi_mqtt_read(topic: string) {
    topic = topic || ''
    let str = `K55 ${topic}`
    serial.writeLine(str)
    // asyncWrite(str, 55)
    
  }

  //% blockId=koi_mqtt_onread block="on Mqtt Data"
  //% group="Wifi" weight=42 draggableParameters=reporter
  export function koi_mqtt_onread(
    handler: (data: string, topic: string) => void
  ) {
    mqttDataEvt = handler
  }


  /**
   * @param file Wav File to record; eg: say.wav
   */
  //% blockId=koi_audio_rec block="WAV Rec %file"
  //% group="Audio" weight=40
  export function koi_audio_rec(file: string) {
    serial.writeLine(`K61 ${file}`)
  }

  /**
   * @param file Wav File to play; eg: say.wav
   */
  //% blockId=koi_audio_play block="WAV Play %file"
  //% group="Audio" weight=39
  export function koi_audio_play(file: string) {
    serial.writeLine(`K62 ${file}`)
  }

  //% blockId=koi_audio_noisetap block="Calibrate noise"
  //% group="Audio" weight=38
  export function koi_audio_noisetap(): void {
    serial.writeLine(`K63`)
  }

  /**
   * @param classid Speech Cmd add; eg: cmd
   */
  //% blockId=koi_speechcmd_addmodel block="Speech Cmd add %classid"
  //% group="Audio" weight=37
  export function koi_speechcmd_addmodel(classid: string) {
    serial.writeLine(`K64 ${classid}`)
  }

  //% blockId=koi_speechcmd_listen block="Speech Cmd Listen"
  //% group="Audio" weight=36
  export function koi_speechcmd_listen(): void {
    let str = `K65`
    serial.writeLine('K65')
    // asyncWrite(str, 65)
  }

  //% blockId=koi_speechcmd_onrecognize block="on Speech Cmd"
  //% group="Audio" weight=35 draggableParameters=reporter
  export function koi_speechcmd_onrecognize(
    handler: (classId: string) => void
  ) {
    speechCmdEvt = handler
  }

  /**
   * @param path json to save; eg: cmd.json
   */
  //% blockId=koi_speechcmd_save block="KOI Save speech cmd %path"
  //% group="Audio" weight=34
  export function koi_speechcmd_save(path: string): void {
    let str = `K66 ${path}`
    serial.writeLine(str)
  }

  /**
   * @param path json to save; eg: cmd.json
   */
  //% blockId=koi_speechcmd_load block="KOI Load speech cmd %path"
  //% group="Audio" weight=33 blockGap=40
  export function koi_speechcmd_load(path: string): void {
    let str = `K67 ${path}`
    serial.writeLine(str)
  }
  
  //% blockId=koi_cloud_facerecognize block="KOI Cloud Face Recognize"
  //% group="CloudAI" weight=30
  export function koi_cloud_facerecognize() {
    let str = `K75`
    serial.writeLine(`K75`)
    // asyncWrite(str, 75)
  }

  //% blockId=koi_cloud_onregface block="on Recognize Face"
  //% group="CloudAI" weight=29 draggableParameters=reporter
  export function koi_cloud_onregface(
    handler: (token: string, sex: string, age: number, mask: number, expression: string) => void
  ) {
    facetokenEvt = handler
  }

  //% blockId=koi_cloud_faceaddgroup block="add face token %TOKEN to Group %GROUP with name %NAME"
  //% group="CloudAI" weight=28
  export function koi_cloud_faceaddgroup(
    TOKEN: string,
    GROUP: string,
    NAME: string
  ) {
    serial.writeLine(`K76 ${TOKEN} ${GROUP} ${NAME}`)
  }

  //% blockId=koi_cloud_facesearch block="search face token %TOKEN in group %GROUP"
  //% group="CloudAI" weight=27
  export function koi_cloud_facesearch(TOKEN: string, GROUP: string) {
    let str =`K77 ${TOKEN} ${GROUP}`
    serial.writeLine(str)
    // asyncWrite(str, 77)
  }

  //% blockId=koi_cloud_onfindface block="on Find Face"
  //% group="CloudAI" weight=26 draggableParameters=reporter blockGap=40
  export function koi_cloud_onfindface(
    handler: (name: string, confidence: number) => void
  ) {
    facefoundEvt = handler
  }

  /**
   * @param TXT text to speech; eg: hello world
   */
  //% blockId=koi_cloud_tts block="TTS %TXT"
  //% group="CloudAI" weight=25
  export function koi_cloud_tts(TXT: string) {
    let str = TXT.split(' ').join('.')
    serial.writeLine(`K78 ${str}`)
  }


  //% blockId=koi_reset block="KOI reset"
  //% group="Basic" weight=10
  //% advanced=true
  export function koi_reset(): void {
    serial.writeLine(`K99`)
  }

  //% blockId=koi_stop_kpu block="KOI Stop kpu"
  //% group="Basic" weight=9 blockGap=40
  //% advanced=true
  export function koi_stop_kpu(): void {
    let str = `K98`
    serial.writeLine(str)
  }

  // /**
  //  * @param txt string to display; eg: 你好世界
  //  */
  // //% blockId=koi_print_unicode block="Print UNICODE X %x Y %y %txt||delay %delay ms"
  // //% x.min=0 x.max=240
  // //% y.min=0 y.max=240
  // //% group="Basic" weight=100
  // //% advanced=true
  // export function koi_print_unicode(
  //   x: number,
  //   y: number,
  //   txt: string,
  //   delay: number = 1000
  // ): void {
  //   let s: string = '${';
  //   for (let i=0;i<txt.length;i++){
  //     s += txt.charCodeAt(i)
  //     if (i != (txt.length-1)) s += ','
  //   }
  //   s += '}'
    
  //   let str = `K5 ${x} ${y} ${delay} ${s}`
  //   serial.writeLine(str)
  // }
 

  /**
   * @param path kmodel to load; eg: model.kmodel
   */
  //% blockId=koi_loadkmodel block="Load KNN model %path"
  //% group="Classifier" weight=90
  //% advanced=true
  export function koi_loadkmodel(path: string) {
    let str = `K45 ${path}`
    serial.writeLine(str)
  }

  //% blockId=koi_inference block="KNN inference"
  //% group="Classifier" weight=89
  //% advanced=true
  export function koi_inference() {
    let str = `K46`
    serial.writeLine(`K46`)
    // asyncWrite(str, 46)
  }

  //% blockId=koi_on_inference block="on Inference"
  //% group="Classifier" weight=88 draggableParameters=reporter blockGap=40
  //% advanced=true
  export function koi_on_inference(handler: (index: number) => void) {
    kmodelEvt = handler
  }

}


