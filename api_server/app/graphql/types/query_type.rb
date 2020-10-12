module Types
  class QueryType < Types::BaseObject
    # Add root-level fields here.
    # They will be entry points for queries on your schema.

    field :lineItems, LineItemConnectionType, null: false, connection: true, description: 'All line-items' do
      argument :orderBy, Types::OrderByType, required: false
      argument :campaign, ID, required: false
      argument :search, Types::SearchType, required: false
    end

    def lineItems(orderBy: nil, campaign: nil, search: nil)
      if campaign
        records = LineItem.where(campaign: campaign)
      elsif search
        case search.field
        when 'line_item'
          records = LineItem.search(size: LineItem.count, query: {match: {'name' => {query: search.value, operator: 'and'}}}).records
        when 'campaign.name'
          records = LineItem.search(size: LineItem.count, query: {match: {'campaign.name' => {query: search.value, operator: 'and'}}}).records
        else
          records = LineItem
        end
      else
        records = LineItem
      end
      if orderBy && (['name', 'booked_amount', 'actual_amount', 'adjustments', 'campaigns.name'].include? orderBy.field) && (['ASC', 'DESC'].include? orderBy.direction)
        return records.includes(:campaign).order("#{orderBy.field} #{orderBy.direction}, line_items.id DESC")
      elsif orderBy && orderBy.field == 'billable_amount' && (['ASC', 'DESC'].include? orderBy.direction)
        return records.includes(:campaign).order("actual_amount + adjustments #{orderBy.direction}, line_items.id DESC")
      else
        return records.includes(:campaign).order(id: :desc)
      end
    end

    field :campaign, CampaignType, null: false, description: 'Get campaign by id' do
      argument :id, ID, required: true
    end

    def campaign(id:)
      Campaign.find(id)
    end
  end
end
