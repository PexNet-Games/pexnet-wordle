import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
	selector: "app-unauthorized",
	standalone: true,
	imports: [CommonModule],
	template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <h1>🚫 Accès Refusé</h1>
        <p class="message">
          Ce jeu nécessite une authentification Discord via le Hub PexNet.
        </p>
        <p class="instruction">
          Veuillez accéder à ce jeu via l'application officielle PexNet.
        </p>
        <div class="icon">🎮</div>
      </div>
    </div>
  `,
	styles: [
		`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .unauthorized-content {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 500px;
      margin: 2rem;
    }

    h1 {
      color: #e74c3c;
      margin-bottom: 1.5rem;
      font-size: 2.5rem;
      font-weight: 600;
    }

    .message {
      font-size: 1.2rem;
      color: #555;
      margin-bottom: 1rem;
      line-height: 1.6;
    }

    .instruction {
      font-size: 1rem;
      color: #777;
      margin-bottom: 2rem;
      line-height: 1.5;
    }

    .icon {
      font-size: 4rem;
      margin-top: 1rem;
      opacity: 0.7;
    }

    @media (max-width: 600px) {
      .unauthorized-content {
        padding: 2rem;
        margin: 1rem;
      }

      h1 {
        font-size: 2rem;
      }
    }
  `,
	],
})
export class UnauthorizedComponent {}
