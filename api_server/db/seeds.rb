# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

if LineItem.count == 0
    path = File.join(File.dirname(__FILE__), './seeds/placements_teaser_data.json')
    line_items = JSON.parse(File.read(path))
    line_items.each do |line_item|
        campaign = Campaign.find_or_create_by!(id: line_item['campaign_id'], name: line_item['campaign_name'])
        row = LineItem.create!(
            id: line_item['id'],
            name: line_item['line_item_name'],
            booked_amount: line_item['booked_amount'],
            actual_amount: line_item['actual_amount'],
            adjustments: line_item['adjustments'],
            campaign_id: campaign.id
        )
    end
    puts 'line-items are seeded'
end