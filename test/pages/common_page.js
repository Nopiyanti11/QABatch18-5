const fs = require("fs");

class CommonPage {
    constructor(driver) {
        this.driver = driver;

        // Otomatis buat folder 'screenshots' jika belum ada
        if (!fs.existsSync("screenshots")) {
            fs.mkdirSync("screenshots");
        }
    }

    // Fungsi screenshot satu layar penuh
    async fullScreenshot(filename){
        const fullScreen = await this.driver.takeScreenshot();

        fs.writeFileSync(`screenshots/${filename}.png`,
            fullScreen,
            "base64"
        );
    }

    // Fungsi screenshot elemen tertentu saja
    async elementScreenshot(element, filename){
        const elementScreen = await this.driver
            .findElement(element)
            .takeScreenshot();
        
        fs.writeFileSync(`screenshots/${filename}.png`,
            elementScreen,
            "base64"
        );
    }
}

module.exports = CommonPage;