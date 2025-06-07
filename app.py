from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash
import jwt
from datetime import datetime, timedelta
import os

import os
from config import config

db = SQLAlchemy()

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    messages = db.relationship('Message', backref='user', lazy=True)

class Theme(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    icon = db.Column(db.String(50))
    messages = db.relationship('Message', backref='theme', lazy=True)

class VoiceModel(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    image = db.Column(db.String(200))
    preview_url = db.Column(db.String(200))
    description = db.Column(db.String(200))
    category = db.Column(db.String(50))
    messages = db.relationship('Message', backref='voice_model', lazy=True)

class BackgroundMusic(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    file = db.Column(db.String(200))
    category = db.Column(db.String(50))

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    audio_url = db.Column(db.String(200))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    theme_id = db.Column(db.String(50), db.ForeignKey('theme.id'), nullable=False)
    voice_model_id = db.Column(db.String(50), db.ForeignKey('voice_model.id'), nullable=False)
    background_music_id = db.Column(db.String(50), db.ForeignKey('background_music.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

def create_app(config_name='default'):
    app = Flask(__name__)
    CORS(app)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Seed initial data if tables are empty
        if not Theme.query.first():
            themes = [
                Theme(id="motivation", name="Motivation", description="Inspiring messages to boost your day", icon="Flame"),
                Theme(id="compliment", name="Compliment", description="Kind words to make you feel special", icon="Heart"),
                Theme(id="joke", name="Joke", description="Funny content to make you laugh", icon="Sparkles"),
                Theme(id="advice", name="Advice", description="Wisdom to guide your decisions", icon="Lightbulb")
            ]
            db.session.add_all(themes)
            
        if not VoiceModel.query.first():
            voice_models = [
                VoiceModel(
                    id="rachel",
                    name="Rachel",
                    image="/placeholder.svg?height=40&width=40",
                    description="Warm and professional female voice, perfect for narration",
                    category="professional",
                    preview_url="/sample-audio.mp3"
                ),
                VoiceModel(
                    id="drew",
                    name="Drew",
                    image="/placeholder.svg?height=40&width=40",
                    description="Deep and authoritative male voice, ideal for motivation",
                    category="motivation",
                    preview_url="/sample-audio.mp3"
                ),
                VoiceModel(
                    id="clyde",
                    name="Clyde",
                    image="/placeholder.svg?height=40&width=40",
                    description="Friendly and approachable male voice",
                    category="casual",
                    preview_url="/sample-audio.mp3"
                )
            ]
            db.session.add_all(voice_models)
            
        if not BackgroundMusic.query.first():
            music = [
                BackgroundMusic(id="motivational", name="Motivational Upbeat", file="/sample-audio.mp3", category="motivation"),
                BackgroundMusic(id="inspirational", name="Inspirational Piano", file="/sample-audio.mp3", category="motivation"),
                BackgroundMusic(id="happy", name="Happy Acoustic", file="/sample-audio.mp3", category="compliment"),
                BackgroundMusic(id="funny", name="Funny Tunes", file="/sample-audio.mp3", category="joke"),
                BackgroundMusic(id="calm", name="Calm Meditation", file="/sample-audio.mp3", category="advice"),
                BackgroundMusic(id="energetic", name="Energetic Pop", file="/sample-audio.mp3", category="general")
            ]
            db.session.add_all(music)
            
        db.session.commit()
    
    return app

# Helper functions
def generate_token(user_id):
    payload = {
        'exp': datetime.utcnow() + timedelta(days=1),
        'iat': datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(
        payload,
        app.config.get('SECRET_KEY'),
        algorithm='HS256'
    )

def decode_token(token):
    try:
        payload = jwt.decode(token, app.config.get('SECRET_KEY'), algorithms=['HS256'])
        return payload['sub']
    except jwt.ExpiredSignatureError:
        return 'Token expired. Please log in again.'
    except jwt.InvalidTokenError:
        return 'Invalid token. Please log in again.'

# Authentication middleware
def token_required(f):
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        user_id = decode_token(token)
        if isinstance(user_id, str):
            return jsonify({'message': user_id}), 401
        
        current_user = User.query.get(user_id)
        if not current_user:
            return jsonify({'message': 'User not found'}), 401
        
        return f(current_user, *args, **kwargs)
    
    decorated.__name__ = f.__name__
    return decorated

# Create app instance
app = create_app(os.getenv('FLASK_CONFIG') or 'default')

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 409
    
    # Create new user
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password
    )
    db.session.add(new_user)
    db.session.commit()
    
    # Generate token
    token = generate_token(new_user.id)
    
    return jsonify({
        'message': 'User created successfully',
        'token': token,
        'user': {
            'id': new_user.id,
            'name': new_user.name,
            'email': new_user.email
        }
    }), 201

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_list = []
    for user in users:
        users_list.append({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'created_at': user.created_at.isoformat()
        })
    return jsonify(users_list)

if __name__ == "__main__":
    app.run(debug=True)

