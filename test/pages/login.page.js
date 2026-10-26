const { Until, By } = require("selenium-webdriver");
const loginLocator = require("../locators/login.locator");
const assert = require("assert");

class LoginPage {
    constructor(driver) {
        // Menyimpan instance driver agar bisa digunakan di seluruh method dalam class ini
        this.driver = driver;
    }

    
    //  Membuka URL halaman login SauceDemo dan memastikannya termuat sempurna
     
    async openBrowser() {
        await this.driver.get(loginLocator.url);
        await this.driver.wait(async () => {
            const url = await this.driver.getCurrentUrl();
            return url === loginLocator.url;
        }, 5000).catch(() => {
        });
    }

    
    //  Mengisi kolom input username dengan data yang dikirimkan
     
    async inputUsername(username){
        const inputUsername = await this.driver.findElement(loginLocator.selectors.usernameInput);
        await inputUsername.sendKeys(username);
    }

    
    // Mengisi kolom input password dengan data yang dikirimkan
    
    async inputPassword(password){
        const inputPassword = await this.driver.findElement(loginLocator.selectors.passwordInput);
        await inputPassword.sendKeys(password);
    } 

    
    // Melakukan klik pada tombol Login
     
    async clickLoginButton() {
        const loginButton = await this.driver.findElement(loginLocator.selectors.loginButton);
        await loginButton.click();
    }

    
    // Memeriksa apakah judul halaman "Products" muncul sebagai indikator sukses login
     
    async assertProductTitle() {
        // Menemukan elemen judul halaman berdasarkan locator productTitle
        const titleElement = await this.driver.findElement(loginLocator.selectors.productTitle);
        const actualTitle = await titleElement.getText();

        // Melakukan assertion untuk memastikan teks judulnya adalah "Products"
        assert.strictEqual(
            actualTitle,
            "Products",
            `Expected title to be 'Products', but got '${actualTitle}'`
        );
    }
    
    // Menunggu kemunculan pesan error pada negative case login dan memvalidasi isinya
    
    async isErrorMessageVisible() {
        const errorElement = await this.driver.findElement(loginLocator.selectors.errorMessage);
        const actualMessage = (await errorElement.getText()).trim();

        assert.strictEqual(
            actualMessage,
            "Epic sadface: Username and password do not match any user in this service"
        );
    }
    
}

module.exports = LoginPage;