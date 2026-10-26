const { Builder, By } = require('selenium-webdriver'); 
const LoginPage = require('../pages/login.page'); 
const CommonPage = require('../pages/common_page');
const VisualRegressionHelper = require('../../utilities/visual_regression_helper');

describe('SauceDemo Login Automation Tests', function () {
    let driver;
    let loginPage;
    let Common;
    let visualHelper;

    // Setup browser sebelum setiap test case dijalankan
    beforeEach(async function () {
        this.timeout(20000);

        // Menggunakan browser Chrome
        driver = await new Builder()
            .forBrowser('chrome')
            .build();
            
        loginPage = new LoginPage(driver);
        Common = new CommonPage(driver);
        visualHelper = new VisualRegressionHelper(); 

        // Panggil login page open browser
        await loginPage.openBrowser(); 
    });

    // Menutup browser setelah setiap test case selesai
    afterEach(async function () {
        await driver.quit();
    });

    it('Positive Test: Login dengan Standard User', async function () {
        this.timeout(15000);

        // 1. Masukkan username dan password yang valid
        await loginPage.inputUsername('standard_user');
        await loginPage.inputPassword('secret_sauce');

        // 2. Klik tombol login
        await loginPage.clickLoginButton();

        // 3. Lakukan assertion untuk memastikan login sukses (muncul judul Products)
        await loginPage.assertProductTitle();

        // 4. (TAMBAHAN) Ambil element screenshot khusus bagian judul "Products"
        await Common.elementScreenshot(
            By.xpath("//*[@data-test='title']"), 
            "product_title_element"
        );

        visualHelper.saveCurrentScreenshot(
            "screenshots/product_title_element.png",
            "product_title_element.png"
        );

        const resultElement = await visualHelper.compareImages(
            "product_title_element.png"
        );
        console.log("Positive Element Result:", resultElement);

        if (!resultElement.hasBaseline) {
            visualHelper.saveAsBaseline(
                "product_title_element.png"
            );
            console.log("Baseline created: product_title_element.png");
        }

        // 5. Take full screenshot after successful login
        await Common.fullScreenshot("visual_standard_user");

        // 6. Copy screenshot to visual-current
        visualHelper.saveCurrentScreenshot(
            "screenshots/visual_standard_user.png",
            "visual_standard_user.png"
        );

        // 7. Compare with baseline
        const resultFull = await visualHelper.compareImages(
            "visual_standard_user.png"
        );
 
        console.log("Positive Full Page Result:", resultFull);
  
        // 8. If baseline doesn't exist
        if (!resultFull.hasBaseline) {
            visualHelper.saveAsBaseline(
                "visual_standard_user.png"
            );
            console.log(
                "Baseline created: visual_standard_user.png"
            );
        }
    });

    it('Negative Test: Should fail to login with invalid username', async function () {
        this.timeout(15000);

        // 1. Masukkan username invalid / locked out
        await loginPage.inputUsername('locked_out');
        await loginPage.inputPassword('secret_sauce');

        // 2. Klik tombol login
        await loginPage.clickLoginButton();

        // 3. Lakukan assertion untuk memastikan pesan error muncul dengan benar
        await loginPage.isErrorMessageVisible();

        // 4. Ambil full screenshot halaman login saat error
        await Common.fullScreenshot("visual_negative_full");
        visualHelper.saveCurrentScreenshot(
            "screenshots/visual_negative_full.png",
            "visual_negative_full.png"
        );
        const resultFull = await visualHelper.compareImages(
            "visual_negative_full.png"
        );
        console.log("Negative Full Page Result:", resultFull);

        if (!resultFull.hasBaseline) {
            visualHelper.saveAsBaseline("visual_negative_full.png");
            console.log("Baseline created: visual_negative_full.png");
        }

        // 5. Ambil element screenshot pesan error
        await Common.elementScreenshot(
            By.xpath("//*[@data-test='error']"), 
            "error_message_locked_out"
        );
        
        // 6. Simpan ke folder current untuk visual regression test pesan error
        visualHelper.saveCurrentScreenshot(
            "screenshots/error_message_locked_out.png",
            "error_message_locked_out.png"
        );

        // 7. Bandingkan dengan baseline error
        const result = await visualHelper.compareImages(
            "error_message_locked_out.png"
        );
        console.log("Negative Element Error Result:", result);

        if (!result.hasBaseline) {
            visualHelper.saveAsBaseline(
                "error_message_locked_out.png"
            );
            console.log("Baseline created for error message element!");
        }
    });
});
