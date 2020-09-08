module Types
  class LineItemType < Types::BaseObject
    field :id, ID, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    field :name, String, null: true
    field :booked_amount, Float, null: true
    field :actual_amount, Float, null: true
    field :adjustments, Float, null: true
    field :campaign, Types::CampaignType, null: true
  end
end
