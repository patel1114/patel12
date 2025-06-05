const svgCaptcha = require("svg-captcha");

function generateCaptcha(req, res) {
    const captcha = svgCaptcha.create();
    req.session.captcha = captcha.text; // Store in session (not database)

    console.log("Generated CAPTCHA:", captcha.text);

    res.type("svg");
    res.send(captcha.data);
}

function verifyCaptcha(req, res, next) {
    const { captcha } = req.body;

    if (!captcha || !req.session.captcha) {
        return res.status(400).json({ message: "CAPTCHA is required." });
    }

    if (captcha !== req.session.captcha) {
        return res.status(400).json({ message: "Incorrect CAPTCHA. Please try again." });
    }

    console.log(" CAPTCHA verified!");
    next(); // Proceed to ticket creation
}

module.exports = { generateCaptcha, verifyCaptcha };
