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
  type Evtssn = (t1: string, t2: string, n: number) => void

  let classifierEvt: EvtNum = null
  let speechCmdEvt: EvtNum = null
  let facetokenEvt: Evtssn = null
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
  let mqttDataEvt: Evtss = null

  const PortSerial = [
    [SerialPin.P8, SerialPin.P0],
    [SerialPin.P12, SerialPin.P1],
    [SerialPin.P13, SerialPin.P2],
    [SerialPin.P15, SerialPin.P14],
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
    Back = 1,
    //% block=Land
    Land = 2,
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
          classifierEvt(parseInt(b[1]))
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
            parseInt(b[6]),
            parseInt(b[7]),
            parseInt(b[8])
          )
        }
      } else if (cmd == 31) {
        // face position
        if (facedetEvt) {
          facedetEvt(parseInt(b[1]), parseInt(b[2]))
        }
      } else if (cmd == 55) {
        if (mqttDataEvt) {
          mqttDataEvt(b[1], b[2])
        }
      } else if (cmd == 65) {
        if (speechCmdEvt) {
          speechCmdEvt(parseInt(b[1]))
        }
      } else if (cmd == 75) {
        if (facetokenEvt) {
          // koi server return: token, age, sex
          facetokenEvt(b[1], b[3], parseInt(b[2]))
        }
      } else if (cmd == 77) {
        if (facefoundEvt) {
          facefoundEvt(b[1], parseInt(b[2]))
        }
      }
    }
  })

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
    basic.pause(300)
    serial.writeLine('K0')
    basic.pause(300)
    serial.writeLine('K0')
    basic.pause(100)
  }

  //% blockId=koi_init_pw block="KOI init powerbrick|Port %port"
  //% group="Basic" weight=100
  export function koi_init_pw(port: SerialPorts): void {
    koi_init(PortSerial[port][1], PortSerial[port][0])
  }

  //% blockId=koi_reset block="KOI Reset"
  //% group="Basic" weight=60
  export function koi_reset(port: SerialPorts): void {
    serial.writeLine('K998')
  }

  //% blockId=koi_reset_cls block="KOI Reset Classifier"
  //% group="Classifier" weight=90
  export function koi_reset_cls(): void {
    let str = `K40`
    serial.writeLine(str)
  }

  /**
   * @param tag tag index; eg: 1
   */
  //% blockId=koi_addtag block="KOI Add Tag %tag"
  //% tag.min=1 tag.max=20
  //% group="Classifier" weight=90
  export function koi_addtag(tag: number): void {
    let str = `K41 ${tag}`
    serial.writeLine(str)
  }

  //% blockId=koi_run block="KOI Run Clissifer"
  //% group="Classifier" weight=90
  export function koi_run(): void {
    let str = `K42`
    serial.writeLine(str)
  }

  /**
   * @param path bin to save; eg: class.bin
   */
  //% blockId=koi_cls_save block="KOI Save Clissifer %path"
  //% group="Classifier" weight=90
  export function koi_cls_save(path: string): void {
    let str = `K43 ${path}`
    serial.writeLine(str)
  }

  /**
   * @param path bin to save; eg: class.bin
   */
  //% blockId=koi_cls_load block="KOI Load Clissifer %path"
  //% group="Classifier" weight=90
  export function koi_cls_load(path: string): void {
    let str = `K44 ${path}`
    serial.writeLine(str)
  }

  //% blockId=koi_classified block="on Identified"
  //% group="Classifier" weight=90 draggableParameters=reporter blockGap=48
  export function koi_classified(handler: (classId: number) => void) {
    classifierEvt = handler
  }

  /**
   * @param name savepath; eg: abc.png
   */
  //% blockId=koi_screenshot block="KOI Screenshot %name"
  //% group="Basic" weight=89
  export function koi_screenshot(name: string): void {
    let str = `K2 ${name}`
    serial.writeLine(str)
  }

  /**
   * @param name png to display; eg: banana.png
   */
  //% blockId=koi_display block="KOI Display %name"
  //% group="Basic" weight=89 blockGap=48
  export function koi_display(name: string): void {
    let str = `K1 ${name}`
    serial.writeLine(str)
  }

  //% blockId=koi_onbtn block="on Button"
  //% weight=89
  //% group="Basic" draggableParameters=reporter
  export function koi_onbtn(
    handler: (btn1: number, btn2: number) => void
  ): void {
    btnEvt = handler
  }

  /**
   * @param txt string to display; eg: hello world
   */
  //% blockId=koi_print block="KOI print X %x Y %y %txt||delay %delay ms"
  //% x.min=0 x.max=240
  //% y.min=0 y.max=240
  //% group="Basic" weight=89
  export function koi_print(
    x: number,
    y: number,
    txt: string,
    delay: number = 1000
  ): void {
    let str = `K4 ${x} ${y} ${delay} ${txt}`
    serial.writeLine(str)
  }

  //% blockId=koi_lcd_direction block="KOI LCD Dir%dir"
  //% group="Basic" weight=89 blockGap=48
  export function koi_lcd_direction(dir: LcdDirection): void {
    let str = `K6 ${dir}`
    serial.writeLine(str)
    basic.pause(100)
  }

  /**
   * @param th threshold; eg: 4000
   */
  //% blockId=koi_track_circle block="KOI track circle threshold%th"
  //% group="Graphic" weight=88
  export function koi_track_circle(th: number): void {
    let str = `K10 ${th}`
    serial.writeLine(str)
  }

  //% blockId=koi_oncircletrack block="on Find Circle"
  //% group="Graphic" weight=88 draggableParameters=reporter blockGap=48
  export function koi_oncircletrack(
    handler: (x: number, y: number, r: number) => void
  ) {
    circleEvt = handler
  }

  /**
   * @param th threshold; eg: 8000
   */
  //% blockId=koi_track_rect block="KOI track rectangle %th"
  //% group="Graphic" weight=87 blockGap=48
  export function koi_track_rect(th: number): void {
    let str = `K11 ${th}`
    serial.writeLine(str)
  }

  //% blockId=koi_onrecttrack block="on Find Rectangle"
  //% group="Graphic" weight=87 draggableParameters=reporter blockGap=48
  export function koi_onrecttrack(
    handler: (x: number, y: number, w: number, h: number) => void
  ) {
    rectEvt = handler
  }

  //% blockId=koi_colorcali block="KOI color calibration"
  //% group="Graphic" weight=86
  export function koi_colorcali() {
    let str = `K16`
    serial.writeLine(str)
  }

  //% blockId=koi_track_line block="KOI track line"
  //% group="Graphic" weight=86
  export function koi_track_line(): void {
    let str = `K12`
    serial.writeLine(str)
  }

  //% blockId=koi_onlinetrack block="on Line Update"
  //% group="Graphic" weight=85 draggableParameters=reporter blockGap=48
  export function koi_onlinetrack(
    handler: (x1: number, y1: number, x2: number, y2: number) => void
  ) {
    lineEvt = handler
  }

  //% blockId=koi_track_colorblob block="KOI track color blob"
  //% group="Graphic" weight=85
  export function koi_track_colorblob(): void {
    let str = `K15`
    serial.writeLine(str)
  }

  //% blockId=koi_oncolorblob block="on Color blob"
  //% group="Graphic" weight=85 draggableParameters=reporter blockGap=48
  export function koi_oncolorblob(
    handler: (x: number, y: number, w: number, h: number) => void
  ) {
    colorblobEvt = handler
  }

  //% blockId=koi_qrcode block="KOI QR code"
  //% group="Tag/Code" weight=83
  export function koi_qrcode() {
    let str = `K20`
    serial.writeLine(str)
  }

  //% blockId=koi_onqrcode block="on QR code"
  //% group="Tag/Code" weight=83 draggableParameters=reporter blockGap=48
  export function koi_onqrcode(handler: (link: string) => void) {
    qrcodeEvt = handler
  }

  //% blockId=koi_barcode block="KOI BAR code"
  //% group="Tag/Code" weight=83
  export function koi_barcode() {
    let str = `K22`
    serial.writeLine(str)
  }

  //% blockId=koi_onbarcode block="on Barcode code"
  //% group="Tag/Code" weight=83 draggableParameters=reporter blockGap=48
  export function koi_onbarcode(handler: (code: string) => void) {
    barcodeEvt = handler
  }

  //% blockId=koi_apriltag block="KOI April Tag"
  //% group="Tag/Code" weight=82
  export function koi_apriltag() {
    let str = `K23`
    serial.writeLine(str)
  }

  //% blockId=koi_onapriltag block="on AprilTag"
  //% group="Tag/Code" weight=83 draggableParameters=reporter blockGap=48
  export function koi_onapriltag(
    handler: (
      id: string,
      x: number,
      y: number,
      w: number,
      h: number,
      rX: number,
      rY: number,
      rZ: number
    ) => void
  ) {
    apriltagEvt = handler
  }

  //% blockId=koi_loadyoloface block="KOI Load Face yolo"
  //% group="Face" weight=81
  export function koi_loadyoloface() {
    let str = `K30`
    serial.writeLine(str)
  }

  //% blockId=koi_facedetect block="KOI face detect"
  //% group="Face" weight=81
  export function koi_facedetect() {
    let str = `K31`
    serial.writeLine(str)
  }

  //% blockId=koi_onfindface block="on Find Face"
  //% group="Face" weight=81 draggableParameters=reporter blockGap=48
  export function koi_onfindface(handler: (x: number, y: number) => void) {
    facedetEvt = handler
  }

  /**
   * @param ssid SSID; eg: ssid
   * @param pass PASSWORD; eg: password
   */
  //% blockId=koi_join_ap block="Join Ap %ssid %pass"
  //% group="Wifi" weight=81
  export function koi_join_ap(ssid: string, pass: string) {
    serial.writeLine(`K50 ${ssid} ${pass}`)
  }

  //% blockId=koi_showip block="Wifi Show IP"
  //% group="Wifi" weight=80
  export function koi_showip() {
    serial.writeLine(`K54`)
  }

  /**
   * @param host Mqtt host; eg: iot.kittenbot.cn
   * @param cid Client ID; eg: clientid
   * @param port Host Port; eg: 1883
   * @param user Username; eg: user
   * @param pass Password; eg: pass
   */
  //% blockId=koi_mqtt_host block="Mqtt Host %host| clientID%cid||Port%port User%user Pass%pass"
  //% group="Wifi" weight=70
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
  //% group="Wifi" weight=61
  export function koi_mqtt_sub(topic: string) {
    serial.writeLine(`K52 ${topic}`)
  }

  /**
   * @param topic Topic to publish; eg: /topic
   * @param data Data to publish; eg: hello
   */
  //% blockId=koi_mqtt_pub block="Mqtt Publish %topic %data"
  //% group="Wifi" weight=60
  export function koi_mqtt_pub(topic: string, data: string) {
    serial.writeLine(`K53 ${topic} ${data}`)
  }

  //% blockId=koi_mqtt_read block="Mqtt Read||%topic"
  //% group="Wifi" weight=60
  export function koi_mqtt_read(topic: string = null) {
    topic = topic || ''
    serial.writeLine(`K55 ${topic}`)
  }

  //% blockId=koi_mqtt_onread block="on Mqtt Data"
  //% group="Wifi" weight=60
  export function koi_mqtt_onread(
    handler: (topic: string, data: string) => void
  ) {
    mqttDataEvt = handler
  }

  /**
   * @param file Wav File to play; eg: bing.wav
   */
  //% blockId=koi_audio_play block="WAV Play %file"
  //% group="Audio" weight=90
  export function koi_audio_play(file: string) {
    serial.writeLine(`K62 ${file}`)
  }

  /**
   * @param file Wav File to record; eg: say.wav
   */
  //% blockId=koi_audio_rec block="WAV Rec %file"
  //% group="Audio" weight=90
  export function koi_audio_rec(file: string) {
    serial.writeLine(`K61 ${file}`)
  }

  /**
   * @param base Noise Base; eg: 12000
   */
  //% blockId=koi_audio_noisetap block="Noise Tap %base"
  //% group="Audio" weight=89
  export function koi_audio_noisetap(base: number) {
    serial.writeLine(`K63 ${base}`)
  }

  //% blockId=koi_speechcmd_addmodel block="Speech Cmd add %classid"
  //% group="Audio" weight=88
  export function koi_speechcmd_addmodel(classid: number) {
    serial.writeLine(`K64 ${classid}`)
  }

  //% blockId=koi_speechcmd_onrecognize block="on Speech Cmd"
  //% group="Audio" weight=87 draggableParameters=reporter blockGap=48
  export function koi_speechcmd_onrecognize(
    handler: (classId: number) => void
  ) {
    speechCmdEvt = handler
  }

  //% blockId=koi_speechcmd_listen block="Speech Cmd Listen"
  //% group="Audio" weight=86
  export function koi_speechcmd_listen(): void {
    let str = `K65`
    serial.writeLine(str)
  }

  //% blockId=koi_cloud_facerecognize block="KOI Cloud Face Recognize"
  //% group="CloudAI" weight=50
  export function koi_cloud_facerecognize() {
    serial.writeLine(`K75`)
  }

  //% blockId=koi_cloud_onregface block="on Recognize Face"
  //% group="CloudAI" weight=49 draggableParameters=reporter blockGap=48
  export function koi_cloud_onregface(
    handler: (token: string, sex: string, age: number) => void
  ) {
    facetokenEvt = handler
  }

  //% blockId=koi_cloud_faceaddgroup block="add face token %TOKEN to Group %GROUP with name %NAME"
  //% group="CloudAI" weight=48
  export function koi_cloud_faceaddgroup(
    TOKEN: string,
    GROUP: string,
    NAME: string
  ) {
    serial.writeLine(`K76 ${TOKEN} ${GROUP} ${NAME}`)
  }

  //% blockId=koi_cloud_facesearch block="search face token %TOKEN in group %GROUP"
  //% group="CloudAI" weight=48
  export function koi_cloud_facesearch(TOKEN: string, GROUP: string) {
    serial.writeLine(`K77 ${TOKEN} ${GROUP}`)
  }

  //% blockId=koi_cloud_onfindface block="on Find Face"
  //% group="CloudAI" weight=46 draggableParameters=reporter blockGap=48
  export function koi_cloud_onfindface(
    handler: (name: string, confidence: number) => void
  ) {
    facefoundEvt = handler
  }
}
