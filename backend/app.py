from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.item_routes import item_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(item_bp, url_prefix="/items")

if __name__ == '__main__':
    app.run(debug=True)
