koi.koi_onbtn(function (btnA, btnB) {
    music.playTone(262, music.beat(BeatFraction.Whole))
})
input.onButtonPressed(Button.A, function () {
    koi.koi_lcd_direction(koi.LcdDirection.Front)
})
input.onButtonPressed(Button.B, function () {
    koi.koi_lcd_direction(koi.LcdDirection.Back)
})
koi.koi_init(SerialPin.P1, SerialPin.P2)
