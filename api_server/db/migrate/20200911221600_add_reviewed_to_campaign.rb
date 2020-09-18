class AddReviewedToCampaign < ActiveRecord::Migration[6.0]
  def change
    add_column :campaigns, :reviewed, :boolean, default: false
  end
end
