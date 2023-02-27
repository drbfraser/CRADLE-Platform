import json
from discord_webhook import DiscordWebhook, DiscordEmbed
import osA

def send_discord_alert(webhook_url):
    webhook = DiscordWebhook(url=webhook_url)

    # Create a Discord Embed

    embed = DiscordEmbed(
        title="CPU Usage Alert",
        description=f"CPU usage is above 90%.",
        color="ff0000")
    # Add the Embed to the webhook
    webhook.add_embed(embed)

    # Execute the webhook
    response = webhook.execute()

    return response

def lambda_handler(event, context):
    # Get the webhook URL and message from the event
    webhook_url = os.environ.get('webhook_url')
    # Send the Discord alert
    response = send_discord_alert(webhook_url)

    return {
        'statusCode': 200,
        'body': json.dumps('Discord alert sent successfully')
    }
