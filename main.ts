/*
Riven
load dependency
"koi": "file:../pxt-koi"
*/

//% color="#5c7cfa" weight=10 icon="\u03f0"
namespace koi {

    type EvtAct = () => void;
    let classiferEvt: EvtAct = null;
    let classifiedIndex:number = null;

    const PortSerial = [
        [SerialPin.P8, SerialPin.P0],
        [SerialPin.P12, SerialPin.P1],
        [SerialPin.P13, SerialPin.P2],
        [SerialPin.P15, SerialPin.P14]
    ]

    export enum SerialPorts {
        PORT1 = 0,
        PORT2 = 1,
        PORT3 = 2,
        PORT4 = 3
    }

    function trim(n: string):string {
        while (n.charCodeAt(n.length-1)<0x1f) {
            n = n.slice(0, n.length-1)
        }
        return n;
    }

    serial.onDataReceived('\n', function () {
        let a = serial.readString()
        if (a.charAt(0) == 'K'){
            a = trim(a)
            let b = a.slice(1, a.length).split(" ")
            let cmd = parseInt(b[0])

            if (cmd == 42){
                classifiedIndex = parseInt(b[1])
                if (classiferEvt){
                    classiferEvt();
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
    //% weight=100
    export function koi_init(tx: SerialPin, rx: SerialPin): void {
        serial.redirect(
            tx,
            rx,
            BaudRate.BaudRate115200
        )
        basic.pause(100)
        serial.setTxBufferSize(64)
        serial.setRxBufferSize(64)
        serial.readString()
        serial.writeString('\n\n')
        basic.pause(1000)
    }

    //% blockId=koi_init_pw block="KOI init powerbrick|Port %port"
    //% weight=100
    export function koi_init_pw(port: SerialPorts): void {
        koi_init(PortSerial[port][1], PortSerial[port][0]);
    }

    //% blockId=koi_reset_cls block="KOI Reset Classifer"
    //% weight=90
    export function koi_reset_cls(): void {
        let str = `K40`;
        serial.writeLine(str)
    }

    //% blockId=koi_addtag block="KOI Add Tag %tag"
    //% tag.min=1 tag.max=20
    //% weight=90
    export function koi_addtag(tag: number): void {
        let str = `K41 ${tag}`;
        serial.writeLine(str)
    }

    //% blockId=koi_run block="KOI Run Clissifer"
    //% weight=90
    export function koi_run(): void {
        let str = `K42 1`;
        serial.writeLine(str)
    }

    //% blockId=koi_stop block="KOI Stop Clissifer"
    //% weight=90
    export function koi_stop(): void {
        let str = `K42 0`;
        serial.writeLine(str)
    }

    //% blockId=koi_classified block="on Identified"
    export function koi_classified(handler: () => void) {
        classiferEvt = handler;
    }

    //% blockId=koi_get_classified block="Get Class"
    export function koi_get_classified():number {
        return classifiedIndex;
    }

    
}
